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

  # <<< Weapons >>>
  /api/products/weapons GET

  # <<< Pruchase >>>
  /api/products/weapons/<weapon-id> POST

  # Body
  {"playerMoney": int}

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

  # <<< Update Weapon >>>
  /api/products/weapons/<weapon-id> PUT

  # Body
  # partial product
  {
    id?: int,
    name?: string,
    price?: int
    description?: int
    stock?: int
  }

  # REQUIRES ADMIN TOKEN
  # header
  "authorization Bearer <token>"

  # <<< Admin login >>>
  /api/admin POST

  # Body
  {"username": str, "password": str}

  # Returns
  200
  {
    "token": string
  }

  404 401 400 500
  {
    "error": true
    "message": string
  }

  # <<< Admin token >>>
  /api/admin/token POST

  # Body
  {"username": str, "password": str}

  # Returns
  200
  {
    "token": string,
    "token_age": string
  }

  404 401 400 500
  {
    "error": true
    "message": string
  }
```

# Playground script
There is a playground shell script to test endpoints around at `./scripts/playground.sh`

Usage:
```  
playground.sh [command] [command args]
  commands:
    - health
      Get Request. Check health of the api
    - products
      Fetch all products
    - weapons
      Fetch all weapons
    - purchaseweapon [(int)weapon-id]  [(int)player-money]
      Purchase the weapon with id 'weapon-id' if 'player-money' is enough.
    - login [(str)username] [(str)password]
      Authenticate admin username and password. Returns an access token.
    - gettoken [(str)username] [(str)password]
      Get the current token for the admin by username and password
    - updateweapon [(str)token] [(int)weapon-id] [(int)stock]
      Test the admin endpoint to update weapons, requires admin token,
      weapon-id and the new stock to set.
"
```
