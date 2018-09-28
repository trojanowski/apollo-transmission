import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import classnames from 'classnames';

const COMPONENTS = {
  'textarea-autosize': TextareaAutosize,
  textarea: 'textarea',
};

export default function Input({ field, form, id, label, type, ...rest }) {
  const showError = form.errors[field.name] && form.touched[field.name];
  const Component = COMPONENTS[type] || 'input';
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <Component
        className={classnames('form-control', {
          'is-invalid': showError,
        })}
        id={id}
        type={COMPONENTS[type] ? null : type}
        {...field}
        {...rest}
      />
      {showError && (
        <div className="invalid-feedback">{form.errors[field.name]}</div>
      )}
    </div>
  );
}
