import React from 'react';
import { Button } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { ScomDataSource } from '../datasource';
import { ScomDataSourceOptions, MyQuery } from '../types';
import PerformanceSection from './PerformanceSection';
import { DsProvider } from './providers/ds.provider';
import './Styles.css';

type Props = QueryEditorProps<ScomDataSource, MyQuery, ScomDataSourceOptions>;

// onRunQuery calls 'query' in the backend.
// datasource calls 'CallResource' in the backend.
export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const { type } = query;

  return (
    <DsProvider datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery}>
      <div className="container">
        <div className="categoriesContainer">
          {buildCategoryButton('Performance', 'performance', 'chart-line')}
          {buildCategoryButton('Alerts', 'alerts', 'bell')}
          {buildCategoryButton('Health State', 'state', 'heart')}
        </div>
        {
          type === 'performance' && (
            <PerformanceSection />
          )
        }
        {/* {
          category === 'alerts' && <AlertsSection query={query} onChange={onChange} onRunQuery={onRunQuery} />
        } */}
        {/* {category === 'healthState' && (
          <HealthStateSection
            query={query}
            datasource={datasource}
            onChange={onChange}
            onRunQuery={onRunQuery}
            groupsData={groupsData}
          />
        )} */}
      </div>
    </DsProvider>
  );

  function buildCategoryButton(name: string, type: "performance" | "alerts" | "state", icon: any) {
    return (
      <Button variant={type === type ? 'primary' : 'secondary'} icon={icon} onClick={() => onCategoryClick(type)}>
        {name}
      </Button>
    );
  }

  function onCategoryClick(type: "performance" | "alerts" | "state") {
    // We send category value to backend to tell it how to structure and render the dashboard data.
    onChange({ ...query, type: type });

    onRunQuery();
  }
}
