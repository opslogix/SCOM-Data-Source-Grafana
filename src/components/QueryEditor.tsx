import React from 'react';
import { Button } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { ScomDataSource } from '../datasource';
import { ScomDataSourceOptions, MyQuery } from '../types';
import PerformanceSection from './PerformanceSection';
import { DsProvider } from './providers/ds.provider';
import './Styles.css';
import AlertsSection from './AlertsSection';
import HealthStateSection from './HealthStateSection';

type Props = QueryEditorProps<ScomDataSource, MyQuery, ScomDataSourceOptions>;

// onRunQuery calls 'query' in the backend.
// datasource calls 'CallResource' in the backend.
export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const { type } = query;

  return (
    <DsProvider datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery}>
      <div className="container">
        <div className="categoriesContainer">
          <Button variant={type === type ? 'primary' : 'secondary'} icon="chart-line" onClick={() => onCategoryClick('performance')}>
            Performance
          </Button>
          <Button variant={type === type ? 'primary' : 'secondary'} icon="bell" onClick={() => onCategoryClick('alerts')}>
            Alerts
          </Button>
          <Button variant={type === type ? 'primary' : 'secondary'} icon="heart" onClick={() => onCategoryClick('state')}>
            Health State
          </Button>
        </div>
        {
          type === 'performance' && (
            <PerformanceSection />
          )
        }
        {
          type === 'alerts' && <AlertsSection />
        }
        {
          type === 'state' && <HealthStateSection />
        }
      </div>
    </DsProvider>
  );

  // function buildCategoryButton(name: string, type: "performance" | "alerts" | "state", icon: any) {
  //   return (
  //     <Button variant={type === type ? 'primary' : 'secondary'} icon={icon} onClick={() => onCategoryClick(type)}>
  //       {name}
  //     </Button>
  //   );
  // }

  function onCategoryClick(type: "performance" | "alerts" | "state") {
    // We send category value to backend to tell it how to structure and render the dashboard data.
    onChange({ ...query, type: type });

    onRunQuery();
  }
}
