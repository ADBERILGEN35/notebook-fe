export const formatRelative = (isoDate?: string) => {
  if (!isoDate) return ''
  const formatter = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  return formatter.format(new Date(isoDate))
}


