export const normalizeElement = (element: string): string => {
  return element
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const createTopicName = (city: string, state?: string, country?: string): string => {
  const locationParts = [normalizeElement(city)];
  
  if (state) {
    locationParts.push(normalizeElement(state));
  }
  
  if (country) {
    locationParts.push(normalizeElement(country));
  }

  return locationParts.join('_');
};
