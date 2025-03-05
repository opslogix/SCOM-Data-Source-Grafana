import { DataSourcePlugin } from '@grafana/data';
import { ScomDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditorLayout } from './components/QueryEditorLayout';

import { ScomDataSourceOptions, ScomQuery } from './types';

export const plugin = new DataSourcePlugin<ScomDataSource, ScomQuery, ScomDataSourceOptions>(ScomDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditorLayout)
// .setVariableQueryEditor(VariableQueryEditor);
