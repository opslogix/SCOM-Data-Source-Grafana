import React, { ChangeEvent, useState } from 'react';
import { Checkbox, InlineField, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { ScomDataSourceOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<ScomDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  // When saving plugin passwords resets. This copy is to still show something.
  const [passwordCopy, setPasswordCopy] = useState('');
  const [checked, setChecked] = useState(false);

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      userName: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        password: event.target.value,
      },
    });

    setPasswordCopy(event.target.value);
  };

  const onCheck = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      isSkipTlsVerifyCheck: event.target.checked,
    };
    onOptionsChange({ ...options, jsonData });
    setChecked(event.currentTarget.checked)
  };
  

  const { jsonData } = options;

  return (
    <div className="gf-form-group">
      <InlineField label="SCOM Url" labelWidth={12}>
        <Input
          onChange={onUrlChange}
          value={jsonData.url || ''}
          placeholder="e.g. https://devvm02.contoso.com"
          width={40}
        />
      </InlineField>

      <InlineField label="Username" labelWidth={12}>
        <Input
          onChange={onUsernameChange}
          value={jsonData.userName || ''}
          placeholder="e.g. contoso\administrator"
          width={40}
        />
      </InlineField>

      <InlineField label="Password" labelWidth={12}>
        <Input onChange={onPasswordChange} value={passwordCopy} width={40} type="password" />
      </InlineField>

      <br />
      <Checkbox
        value={jsonData.isSkipTlsVerifyCheck || checked}
        onChange={onCheck}
        label={'Skip TLS cert validation'}
        description={'Set to true if you want to skip TLS cert validation'}
      />
    </div>
  );
}
