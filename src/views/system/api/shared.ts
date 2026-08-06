export const methodTagType = (method: string): 'success' | 'primary' | 'warning' | 'error' | 'info' | 'default' => {
  switch (method) {
    case 'GET':
      return 'success';
    case 'POST':
      return 'primary';
    case 'PUT':
      return 'warning';
    case 'DELETE':
      return 'error';
    case 'PATCH':
      return 'info';
    default:
      return 'default';
  }
};

export const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
];
