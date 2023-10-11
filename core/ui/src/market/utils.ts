export const BASE_URL = 'https://ckaho.liqnft.com/api';

export const getParametrizeQuery = (queryString: string | string[]): string => {
  if (!queryString || queryString.length === 0) {
    return '';
  }
  const singleQuery = typeof queryString === 'string';
  if (singleQuery) {
    return `?${queryString}`;
  }
  // Multiple queries case
  const firstQuery = queryString[0];
  let followQueries = '';
  for (let i = 1; i < queryString.length; i++) {
    followQueries = followQueries.concat(`&${queryString[i]}`);
  }
  return `?${firstQuery}${followQueries}`;
};
