import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { AlertQuery, ScomDataSourceOptions, ScomQuery } from './types';

export class ScomDataSource extends DataSourceWithBackend<ScomQuery, ScomDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<ScomDataSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(app: CoreApp): Partial<AlertQuery> {
    return {
      type: 'alerts',
      criteria: 'Severity = 2 AND ResolutionState = 0'
    }
  }

  // // * Returns options for variable use. Without this it gives error?
  // async metricFindQuery(query: ScomQuery, options?: any) {
  //   // const values = [{ text: 'Option 1' }, { text: 'Option 2' }];

  //   return [];
  // }


  // applyTemplateVariables(query: MyQuery, scopedVar: any, filters: any): MyQuery {
  //   const classInstanceIdVar = '${classInstanceId}'; // Name has to match with the variable name in Grafana dashboard.
  //   const classInstanceId = getTemplateSrv().replace(classInstanceIdVar);

  //   // Check that we have variables.
  //   // And we have class instance id.
  //   // We are fetching performance data.
  //   // Because this function is reached in creating or editing of dashboards aswell.
  //   if (
  //     getTemplateSrv().getVariables().length > 0 &&
  //     classInstanceId?.length > 0 &&
  //     query.type === 'performance'
  //   ) {
  //     // Update performance query with selected instance id.
  //     const selectedObject = {
  //       id: classInstanceId,
  //       displayname: '',
  //       fullname: '',
  //       path: '',
  //     };

  //     return {
  //       ...query,
  //       performanceObjects: [selectedObject],
  //     };
  //   }

  //   return {
  //     ...query,
  //   };
  // }
}
