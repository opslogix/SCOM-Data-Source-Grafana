import React, { useState } from 'react';
import { IconName, Tab, TabContent, TabsBar } from '@grafana/ui';
import PerformanceSection from './PerformanceSection';
import { useDs } from './providers/ds.provider';
import AlertsSection from './AlertsSection';
import HealthStateSection from './HealthStateSection';

// onRunQuery calls 'query' in the backend.
// datasource calls 'CallResource' in the backend.
export function QueryEditor() {

  const { query } = useDs();

  const [tabs, updateTabs] = useState([{
    label: 'Performance',
    active: query.type === 'performance',
    icon: 'bolt' as IconName,
    element: <PerformanceSection />
  }, {
    label: 'Alerts',
    icon: 'bell' as IconName,
    active: query.type === 'alerts',
    element: <AlertsSection />
  }, {
    label: 'Health',
    icon:'heart' as IconName,
    active: query.type === 'state',
    element: <HealthStateSection />
  }])

  const onChangeTab = (index: number) => {
    updateTabs(tabs.map((tab, indx) => ({
      ...tab,
      active: index === indx
    })));

    //Set active query?
    //Execute query?
  }

  return (
    <>
      <TabsBar>
        {
          tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} icon={tab.icon} active={tab.active} onChangeTab={() => onChangeTab(index)} />
          ))
        }
      </TabsBar>
      <TabContent>
        {
          tabs.find((tab) => tab.active)?.element
        }
      </TabContent>
    </>
  );
}
