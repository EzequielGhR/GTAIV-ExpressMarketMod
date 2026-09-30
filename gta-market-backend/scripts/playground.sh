base_url="http://localhost:3000/api"
help_msg="Usage: ${0} [command] [command args]
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

function _get() {
  local url=$1
  local token=$2
  cmd='curl -H "Content-Type: application/json"'
  if [ ! -z $token ]
    then cmd+=" -H \"authorization: Bearer ${token}\""
  fi

  cmd+=" $url"
  eval $cmd
}

function _post() {
  local url=$1
  local data=$2
  local token=$3

  cmd='curl -H "Content-Type: application/json"'
  if [ ! -z $token ]
    then cmd+=" -H \"authorization: Bearer ${token}\""
  fi

  cmd+=" -d '${data}' ${url}"

  eval $cmd
}

function _put() {
  local url=$1
  local data=$2
  local token=$3

  cmd='curl -X PUT -H "Content-Type: application/json"'
  if [ ! -z $token ]
    then cmd+=" -H \"authorization: Bearer ${token}\""
  fi

  if [ ! -z "${data}" ]
    then cmd+=" -d '${data}'"
  fi

  cmd+=" ${url}"
  eval $cmd
}

function health() {
  _get $base_url
}

function products() {
  _get "${base_url}/products"
}

function weapons() {
  _get "${base_url}/products/weapons"
}

function purchase_weapon() {
  local weapon_id=$1
  local player_money=$2

  _post "${base_url}/products/weapons/${weapon_id}" "{\"playerMoney\": \"${player_money}\"}"
}

function login() {
  local user=$1
  local pass=$2

  _post "${base_url}/admin" "{\"username\": \"${user}\", \"password\": \"${pass}\"}"
}

function get_token() {
  local user=$1
  local pass=$2

  _post "${base_url}/admin/token" "{\"username\": \"${user}\", \"password\": \"${pass}\"}"
}

function update_weapon() {
  local token=$1
  local weapon_id=$2
  local stock=$3


  local data="{\"stock\": \"${stock}\"}"

  _put "${base_url}/products/weapons/${weapon_id}" "${data}" $token
}

function show_help() {
  printf "%s\n" "${help_msg}"
}

case $1 in
  health)
    health
    ;;
  products)
    products
    ;;
  weapons)
    weapons
    ;;
  purchaseweapon)
    purchase_weapon $2 $3
    ;;
  login)
    login $2 $3
    ;;
  gettoken)
    get_token $2 $3
    ;;
  updateweapon)
    update_weapon $2 $3 $4
    ;;
  *)
    show_help;
    ;;
esac
