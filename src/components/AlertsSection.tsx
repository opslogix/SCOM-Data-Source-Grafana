// import { Button, InlineField, Input } from '@grafana/ui';
// import React, { ChangeEvent } from 'react';
// import { MyQuery } from 'types';

// type Props = {
//   query: MyQuery;
//   onChange: (query: MyQuery) => void;
//   onRunQuery: () => void;
// };

// export default function AlertsSection({ query, onChange, onRunQuery }: Props) {
//   return (
//     <div className="alertsContainer">
//       <InlineField label="Criteria" labelWidth={16}>
//         <Input
//           onChange={onAlertsCriteriaChange}
//           value={query?.alertsCriteria || ''}
//           placeholder="E.g. Severity = 2 and ResolutionState = 0"
//           className="alertsInput"
//         />
//       </InlineField>
//       <Button variant="secondary" icon="search" onClick={onGetAlerts}>
//         Search
//       </Button>
//     </div>
//   );

//   function onGetAlerts() {
//     onChange({ ...query, toFetch: 'alerts' });
//     onRunQuery();
//   }

//   function onAlertsCriteriaChange(event: ChangeEvent<HTMLInputElement>) {
//     onChange({ ...query, alertsCriteria: event.target.value });
//   }
// }
