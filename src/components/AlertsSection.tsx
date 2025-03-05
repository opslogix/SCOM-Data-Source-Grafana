import { Box, Button, FieldSet, InlineField, Input } from '@grafana/ui';
import React, { useState } from 'react';
import { useDs } from './providers/ds.provider';
import { AlertQuery } from 'types';

export default function AlertsSection() {
    const { getAlerts, query } = useDs();

    const alertQuery = query as AlertQuery;

    const [criteria, setCriteria] = useState(alertQuery.criteria);

    return (
        <Box padding={1} paddingTop={2}>
            <FieldSet>
                <InlineField label="Criteria" labelWidth={16}>
                    <Input
                        onChange={(v) => setCriteria(v.currentTarget.value)}
                        value={criteria}
                        placeholder="E.g. Severity = 2 and ResolutionState = 0"
                        className="alertsInput"
                    />
                </InlineField>
                <InlineField>
                    <Button variant="secondary" icon="search" onClick={() => getAlerts(criteria ?? '')}>
                        Search
                    </Button>
                </InlineField>
            </FieldSet>
        </Box>
    );
}
