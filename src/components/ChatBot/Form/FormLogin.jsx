import { useRef, useState } from 'react';
import CommonInput from '../../common/common_input';
import style from './Form.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';
function FormLogin({ hidden, setShowLogin }) {
    const username = useRef();
    const password = useRef();
    const [textLogin, setTextLogin] = useState('Bạn phải đăng nhập để tiếp tục');
    const [isLoading, setIsLoading] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true)
        fetch('http://localhost:8080/auth/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username.current.value,
                password: password.current.value
            })
        }).then(response => {
            // làm gì khi status trả về là 401
            if (response.status == 401) {
                setTextLogin("Tài khoản hoặc mất khẩu không đúng")
                return null;
            }
            console.log(response.status)
            return response.json();
        })
            .then(value => {
                if (value) {
                    let { token } = value;
                    localStorage.setItem("token", token)
                    console.log(token)
                    setShowLogin(false)
                    setIsLoading(false)
                }

            })
            .catch(error => {
                setIsLoading(false); 
                setTextLogin("Đã xảy ra lỗi. Vui lòng thử lại.");
                console.error("Lỗi đăng nhập:", error);
            });
    }

    return <div className={style['form_container']} hidden={!hidden}>
        <form onSubmit={onSubmit}>
            <div className={style['form_action']}>
                <CommonInput ref={username} type="text" placeholder="Doctor ID" required />
                <CommonInput ref={password} type="password" placeholder="Password" required />
                 <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng nhập...
              </>
            ) : (
              "Login"
            )}
          </button>
            </div>
        </form>
        <p style={{ color: 'red' }}>{textLogin}</p>
    </div>
}

export default FormLogin