import UserContext from "../context/User-Context"

export default function AuthenticationProvider(props){
    return(
        <div>
            <UserContext.Provider>
                {props.children}
            </UserContext.Provider>
        </div>
    )
}