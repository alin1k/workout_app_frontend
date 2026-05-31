import Icon from './Icon.jsx';

function Toast({ message, icon }) {
  if (!message) return null;
  return (
    <div className="toast-wrap">
      <div className="toast">
        {icon && <Icon name={icon} size={16} />}
        {message}
      </div>
    </div>
  );
}

export default Toast;
