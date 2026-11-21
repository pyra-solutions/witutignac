import { findDictionary } from '../config/mock-config';
import { DocumentTypeDefinition, FieldDefinition } from '../models/config.model';

type Schema = Record<string, unknown>;

function leafSchema(field: FieldDefinition): Schema {
  const nullable = (type: string): string | string[] => (field.nullable ? [type, 'null'] : type);
  const base: Schema = { description: field.instruction };

  if (field.dictionary) {
    const dictionary = findDictionary(field.dictionary);
    if (dictionary) {
      const values = dictionary.valueKind === 'id' ? dictionary.entries.map((e) => e.id) : dictionary.entries.map((e) => e.label);
      const isId = dictionary.valueKind === 'id';
      return { ...base, type: nullable(isId ? 'integer' : 'string'), enum: field.nullable ? [...values, null] : values };
    }
  }

  switch (field.type) {
    case 'data':
      return { ...base, type: nullable('string'), format: 'date' };
    case 'kwota':
    case 'liczba':
      return { ...base, type: nullable('number') };
    case 'flaga':
      return { ...base, type: nullable('integer'), enum: field.nullable ? [0, 1, null] : [0, 1] };
    default:
      return { ...base, type: nullable('string') };
  }
}

function objectSchema(): Schema {
  return { type: 'object', additionalProperties: false, properties: {}, required: [] as string[] };
}

/**
 * Buduje JSON Schema odpowiedzi z definicji pól. Ten schemat silnik przekazuje do LLM
 * jako `response_format: json_schema`, więc struktura odpowiedzi wynika wyłącznie z konfiguracji.
 */
export function buildJsonSchema(definition: DocumentTypeDefinition): Schema {
  const root = objectSchema();

  for (const field of definition.fields) {
    let node = root;
    const segments = field.path.split('.');
    segments.forEach((segment, i) => {
      const isList = segment.endsWith('[]');
      const name = isList ? segment.slice(0, -2) : segment;
      const isLast = i === segments.length - 1;
      const properties = node['properties'] as Record<string, Schema>;
      const required = node['required'] as string[];
      if (!required.includes(name)) required.push(name);

      if (isLast) {
        properties[name] = isList ? { type: 'array', items: leafSchema(field) } : leafSchema(field);
        return;
      }
      if (!properties[name]) {
        properties[name] = isList ? { type: 'array', items: objectSchema() } : objectSchema();
      }
      node = isList ? (properties[name]['items'] as Schema) : properties[name];
    });
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: definition.name,
    ...root,
  };
}
