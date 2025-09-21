// PIN code to location mapping utility
// This is a simplified version - in production, you'd use a proper API like India Post API

interface PincodeData {
  city: string
  state: string
  country: string
}

// Mock data for common PIN codes
const PINCODE_DATA: Record<string, PincodeData> = {
  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '400002': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '400003': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '400004': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '400005': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '110002': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '110003': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '110004': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '110005': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  
  // Bangalore
  '560001': { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  '560002': { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  '560003': { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  '560004': { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  '560005': { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '600003': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '600004': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '600005': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  
  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '700002': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '700003': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '700004': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '700005': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '500002': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '500003': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '500004': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '500005': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '411002': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '411003': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '411004': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '411005': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  
  // Ahmedabad
  '380001': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '380002': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '380003': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '380004': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '380005': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  
  // Jaipur
  '302001': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  '302002': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  '302003': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  '302004': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  '302005': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  
  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  '226002': { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  '226003': { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  '226004': { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  '226005': { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  
  // US ZIP codes (for international support)
  '10001': { city: 'New York', state: 'New York', country: 'United States' },
  '10002': { city: 'New York', state: 'New York', country: 'United States' },
  '90210': { city: 'Beverly Hills', state: 'California', country: 'United States' },
  '94102': { city: 'San Francisco', state: 'California', country: 'United States' },
  '60601': { city: 'Chicago', state: 'Illinois', country: 'United States' },
  '33101': { city: 'Miami', state: 'Florida', country: 'United States' },
  '75201': { city: 'Dallas', state: 'Texas', country: 'United States' },
  '98101': { city: 'Seattle', state: 'Washington', country: 'United States' },
}

/**
 * Get location data from PIN code
 * @param pincode - The PIN code to lookup
 * @returns Location data or null if not found
 */
export function getLocationFromPincode(pincode: string): PincodeData | null {
  const cleanPincode = pincode.replace(/\s+/g, '').trim()
  
  if (!cleanPincode || cleanPincode.length < 5) {
    return null
  }
  
  return PINCODE_DATA[cleanPincode] || null
}

/**
 * Validate PIN code format
 * @param pincode - The PIN code to validate
 * @returns True if valid format
 */
export function isValidPincode(pincode: string): boolean {
  const cleanPincode = pincode.replace(/\s+/g, '').trim()
  
  // Indian PIN codes: 6 digits
  if (/^\d{6}$/.test(cleanPincode)) {
    return true
  }
  
  // US ZIP codes: 5 digits or 5+4 format
  if (/^\d{5}(-\d{4})?$/.test(cleanPincode)) {
    return true
  }
  
  return false
}

/**
 * Auto-fill location data based on PIN code
 * @param pincode - The PIN code
 * @returns Object with city, state, and country or null
 */
export function autoFillLocation(pincode: string): Partial<PincodeData> | null {
  if (!isValidPincode(pincode)) {
    return null
  }
  
  return getLocationFromPincode(pincode)
}
