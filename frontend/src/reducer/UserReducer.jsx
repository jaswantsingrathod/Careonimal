const UserReducer = (state, action) => {
    switch(action.type){
        case "LOGIN": {
            return{ ...state, isLoggedIn: true, user: action.payload, serverError: ""}
        }
        case "SET_USERS": {
            return {...state, users: action.payload, serverError: ""}
        }
        case "SERVER_ERRORS": {
            return {...state, serverError: action.payload}
        }
        case "LOGOUT": {
            return {...state, isLoggedIn: false}
        }
        case "CLEAR_ERROR": {
            return {...state, serverError:""}
        }
        default: {
            return {...state}
        }
    }
}

export default UserReducer