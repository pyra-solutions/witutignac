-- Osobna baza dla testów backendu (pytest), żeby testy nie czyściły danych deweloperskich.
-- Skrypt wykonuje się tylko przy pierwszym utworzeniu wolumenu pgdata.
CREATE DATABASE odwolania2json_test TEMPLATE template0;
