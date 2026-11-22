import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActiveConfigDto, ModelDto, ProviderDto, SystemDto } from '../api/api.models';
import { apiErrorMessage } from '../api/errors';
import { Dictionary, DocumentTypeDefinition, LlmModelInfo, LlmProvider } from '../models/config.model';
import {
  engineSettings,
  mapConversionProfile,
  mapDictionary,
  mapDocumentType,
  mapLlmProfile,
  mapModel,
  mapProvider,
} from './map-release';

/**
 * Konfiguracja, której używa silnik: aktywne wydanie z engine/config/release.json (API /api/config/active),
 * oraz metadane dostawców i modeli LLM z config/seed/llm_providers.yaml.
 */
@Injectable({ providedIn: 'root' })
export class ConfigStore {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly providers = signal<LlmProvider[]>([]);
  readonly models = signal<LlmModelInfo[]>([]);
  readonly system = signal<SystemDto | null>(null);
  private readonly active = signal<ActiveConfigDto | null>(null);

  private readonly snapshot = computed(() => this.active()?.snapshot ?? null);
  readonly version = computed(() => this.snapshot()?.version ?? null);
  readonly publishedVersion = computed(() => this.active()?.published_version ?? null);
  readonly source = computed(() => this.active()?.source ?? 'engine/config/release.json');
  readonly defaultLlmProfile = computed(() => this.snapshot()?.settings.default_llm_profile ?? '');

  readonly documentTypes = computed<DocumentTypeDefinition[]>(() => {
    const s = this.snapshot();
    return s ? s.document_types.map((dt) => mapDocumentType(dt, s.settings.default_llm_profile)) : [];
  });
  readonly dictionaries = computed<Dictionary[]>(() => this.snapshot()?.dictionaries.map(mapDictionary) ?? []);
  readonly llmProfiles = computed(() => {
    const s = this.snapshot();
    return s ? s.llm_profiles.map((p) => mapLlmProfile(p, s.settings.default_llm_profile)) : [];
  });
  readonly conversionProfiles = computed(() => this.snapshot()?.conversion_profiles.map(mapConversionProfile) ?? []);
  readonly engineSettings = computed(() => {
    const s = this.snapshot();
    return s ? engineSettings(s) : [];
  });

  constructor() {
    void this.load();
  }

  documentType(code: string | null | undefined): DocumentTypeDefinition | undefined {
    return code ? this.documentTypes().find((t) => t.code === code) : undefined;
  }

  dictionary(code: string | null | undefined): Dictionary | undefined {
    return code ? this.dictionaries().find((d) => d.code === code) : undefined;
  }

  typeName(code: string | null | undefined): string {
    if (!code) return '—';
    return this.documentType(code)?.name ?? code;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [active, providers, models] = await Promise.all([
        firstValueFrom(this.http.get<ActiveConfigDto>('/api/config/active')),
        firstValueFrom(this.http.get<ProviderDto[]>('/api/llm-providers')).catch(() => []),
        firstValueFrom(this.http.get<ModelDto[]>('/api/llm-models')).catch(() => []),
      ]);
      this.active.set(active);
      this.providers.set(providers.map(mapProvider));
      this.models.set(models.map(mapModel));
      await this.refreshSystem();
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Nie udało się wczytać konfiguracji silnika.'));
    } finally {
      this.loading.set(false);
    }
  }

  async refreshSystem(): Promise<void> {
    try {
      this.system.set(await firstValueFrom(this.http.get<SystemDto>('/api/system')));
    } catch {
      this.system.set(null);
    }
  }
}
