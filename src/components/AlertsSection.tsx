import { Button, InlineField, Input } from '@grafana/ui';
import React, { useState } from 'react';
import { useDs } from './providers/ds.provider';

export default function AlertsSection() {
    const { getAlerts, query } = useDs();
    const [criteria, setCriteria] = useState(query.criteria);

    return (
        <div className="alertsContainer">
            <InlineField label="Criteria" labelWidth={16}>
                <Input
                    onChange={(v) => setCriteria(v.currentTarget.value)}
                    value={criteria}
                    placeholder="E.g. Severity = 2 and ResolutionState = 0"
                    className="alertsInput"
                />
            </InlineField>
            <Button variant="secondary" icon="search" onClick={() => getAlerts(criteria ?? '')}>
                Search
            </Button>
        </div >
    );
}
