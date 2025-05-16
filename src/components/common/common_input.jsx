import 'bootstrap/dist/css/bootstrap.min.css';
export default function CommonInput({placeholder , type , ref}) {
    return <>
        <input className='p-3' ref={ref} type={type} placeholder={placeholder} required />
    </>
}