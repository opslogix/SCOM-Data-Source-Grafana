import { DataSourcePlugin } from '@grafana/data';
import { ScomDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { MyQuery, ScomDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<ScomDataSource, MyQuery, ScomDataSourceOptions>(ScomDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  // .setVariableQueryEditor(VariableQueryEditor);
