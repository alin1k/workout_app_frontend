function TextInput({ value, onChange, invalid, ...rest }) {
  return (
    <input
      {...rest}
      className={'input' + (invalid ? ' invalid' : '')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default TextInput;
