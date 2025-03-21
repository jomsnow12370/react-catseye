import ProgressBar from 'react-bootstrap/ProgressBar';

function QProgressBar(quota) {
  const now = quota.quota;
  return <ProgressBar max={500} variant='secondary' visuallyHidden="true" now={now} label={`${now}`} />;
}

export default QProgressBar;