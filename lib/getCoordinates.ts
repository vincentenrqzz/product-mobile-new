const getCoordinatesFromAddress = async (address: string) => {
  // Encode the address to make it URL-friendly
  const encodedAddress = encodeURIComponent(address)

  // Now use the Google Maps Geocoding API to get the coordinates
  const googleMapsApiKey = 'AIzaSyA6eWDua3thzpUmk9Of60hzgy6ygEeklT8' // Replace with your actual API key
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`

  const response = await fetch(geocodeUrl)
  const data = await response.json()

  if (data.status === 'OK') {
    const { lat, lng } = data.results[0].geometry.location // Extract latitude and longitude
    return { latitude: lat, longitude: lng } // Return coordinates with the names 'latitude' and 'longitude'
  } else {
    console.log('Geocoding error:', data.status)
    return { latitude: undefined, longitude: undefined } // Return coordinates with the names 'latitude' and 'longitude'
  }
}

export default getCoordinatesFromAddress
