import Icon from './Icon.jsx';

function Toast({ message, icon }) {
  if (!message) return null;
  const cls = 'toast' + (icon === 'alert' ? ' toast-alert' : '');
  return (
    <div className="toast-wrap">
      <div className={cls}>
        {icon && <Icon name={icon} size={16} />}
        {message}
      </div>
    </div>
  );
}

export default Toast;
