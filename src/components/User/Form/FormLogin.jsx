import { useRef } from 'react';
import CommonInput from '../../common/common_input';
import style from './FormLogin.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';
function FormLogin({hidden , setShowLogin}) {
    const username = useRef();
    const password = useRef();
    function onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        fetch('http://localhost:8080/auth/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body : JSON.stringify({
                username : username.current.value,
                password : password.current.value
            })
        }).then(response => {
            // làm gì khi status trả về là 401
            if (response.status == 401) {
                return null;
            }
            console.log(response.status)
            return response.json();
        })
        .then(value => {
            if (value) {
                let {token} = value;
                localStorage.setItem("token" , token)
                console.log(token)
                setShowLogin(false)
            }
            
        })
    }
    
    return <div className={style['form_container']} hidden={!hidden}>
        <form onSubmit={onSubmit}>
            <div className={style['form_action']}>
                <CommonInput ref={username} type="text" placeholder="Doctor ID" required />
                <CommonInput ref={password} type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </div>
            <p style={{color : 'red'}}>Bạn phải đăng nhập để tiếp tục</p>
        </form>
    </div>
}

export default FormLogin