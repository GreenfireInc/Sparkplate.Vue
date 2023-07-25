export const validator = (type, value) => {
  const fullnameRegex = /^([A-z]+)([ ]*)([A-z]*)$/
  const firstnameRegex = /^([A-z]+)$/
  const lastnameRegex = /^([A-z]+)$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const mobileRegex =
    /^\(*\+*[0-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/i
  const phoneRegex = /^([0-9]{7,11})$/
  const passwordRegex =
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
  // eslint-disable-next-line no-irregular-whitespace
  const linkRegex =
    /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
  const generalRegex = /(\S+)/
  const numberRegex = /(\d+)/
  const businessRegex = /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
  const priceRegex = /^[1-9]\d{0,7}(?:\.\d{1,4})?$/
  const zipRegex = /^(\d){4,7}$/
  const ssnRegex = /^(?:\d{3}-\d{2}-\d{4})$/
  const tinRegex = /^(?:\d{2}-\d{7})$/

  if (type === 'singlename') {
    if (firstnameRegex.test(value)) return true
    return false
  } else if (type === 'fullname') {
    if (fullnameRegex.test(value)) return true
    return false
  } else if (type === 'lastname') {
    if (lastnameRegex.test(value)) return true
    return false
  } else if (type === 'number') {
    if (numberRegex.test(value)) return true
    return false
  } else if (type === 'zip') {
    if (zipRegex.test(value)) return true
    return false
  } else if (type === 'mobile') {
    if (mobileRegex.test(value)) return true
    return false
  } else if (type === 'email') {
    if (emailRegex.test(value)) return true
    return false
  } else if (type === 'phone') {
    if (phoneRegex.test(value)) return true
    return false
  } else if (type === 'price') {
    if (priceRegex.test(value)) return true
    return false
  } else if (type === 'password') {
    if (passwordRegex.test(value)) return true
    return false
  } else if (type === 'ssn') {
    if (ssnRegex.test(value)) return true
    return false
  } else if (type === 'tin') {
    if (tinRegex.test(value)) return true
    return false
  } else if (type === 'link') {
    if (linkRegex.test(value)) return true
    return false
  } else if (type === 'general') {
    if (generalRegex.test(value)) return true
    return false
  } else if (type === 'business') {
    if (businessRegex.test(value)) return true
    return false
  }
}
