import { useAuth } from "../context/AuthContext";


export default function usePermission(){

const {user}=useAuth();


return {

isAdmin:
user?.role==="admin",

isEmployee:
user?.role==="employee",

canEdit:
user?.role==="admin" ||
user?.role==="employee",

canDelete:
user?.role==="admin",

canCreate:
user?.role==="admin"

};


}