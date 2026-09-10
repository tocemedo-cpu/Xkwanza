import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// @testing-library/react só regista a limpeza automática quando detecta um
// `afterEach` global — como não usamos `test.globals` no vitest.config.ts,
// registamo-la aqui explicitamente para não acumular DOM entre testes.
afterEach(cleanup);
