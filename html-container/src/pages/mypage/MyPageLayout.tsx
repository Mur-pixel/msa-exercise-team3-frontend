import { NavLink, Outlet } from "react-router-dom";
export default function MyPageLayout() {
    return (
        <div className="mypage">
            <div className="tabs">
                <NavLink to="profile">내프로필</NavLink>
                <NavLink to="edit">회원정보 수정</NavLink>
                <NavLink to="delete">회원탈퇴</NavLink>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}