# Setup
`yarn install`

# Run test server
`yarn dev`

# Build and run
`yarn build && yarn start`

# Endpoints (WIP)
App runs by default on localhost:3000

```
  # <<< Helth check >>>
  /api GET

  # Returns
  200
  {"message": "Healthy"}

  # <<< Products >>>
  /api/products GET

  # <<< Pruchase >>>
  /api/products/purchase POST

  # Body
  {"productId": int, "playerMoney": int}

  # Returns
  200
  {
    "message": str,
    "product": {
      "id": int,
      "name": string,
      "price": int,
      "description": string,
      "stock": int
    }
  }

  404 400 500
  {
    "error": true,
    "message": string
  }
```
