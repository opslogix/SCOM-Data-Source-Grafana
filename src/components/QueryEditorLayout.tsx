import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { ScomDataSource } from '../datasource';
import { ScomDataSourceOptions, ScomQuery } from '../types';
import { DsProvider } from './providers/ds.provider';
import { QueryEditor } from './QueryEditor';

type Props = QueryEditorProps<ScomDataSource, ScomQuery, ScomDataSourceOptions>;

// onRunQuery calls 'query' in the backend.
// datasource calls 'CallResource' in the backend.
export function QueryEditorLayout({ query, onChange, onRunQuery, datasource }: Props) {
  return (
    <DsProvider datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery}>
      <QueryEditor />
    </DsProvider>
  );
}
