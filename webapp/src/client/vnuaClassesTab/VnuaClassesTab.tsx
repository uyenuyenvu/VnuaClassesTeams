import * as React from "react";
import { Provider, Button, Input,  Dialog } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { Student } from "./../../types/Student";
import { Semester } from "../../types/Semester";
import { ListIcon, TeamCreateIcon} from "@fluentui/react-icons-northstar";
import Swal from 'sweetalert2'
import axios from "axios";
import {Provider as ReduxProvider} from "react-redux/es/exports";
import {store} from "../client";
import _ from "lodash";


/**
 * Implementation of the Vnua classes content page
 */

const API_URL="https://a010-116-104-51-98.ngrok-free.app/";

const mode = {
    IS_AUTHENCATED: 1,
    IS_LOGIN: 2,
    IS_REGISTER: 3
};
export const VnuaClassesTab = () => {
    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [email, setEmail] = useState<string | undefined>();
    const [teacherCode, setTeacherCode] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [rePassword, setRePassword] = useState<string | undefined>();
    const [curentMode, setCurrentMode] = useState<Number>(1);
    const [countDone, setCountDone] = useState<number>(0);
    const [countError, setCountError] = useState<number>(0);
    const [errTeacherCode, setErrTeacherCode] = useState<string>("");
    const [errEmail, setErrEmail] = useState<string>("");
    const [errPass, setErrPass] = useState<string>("");
    const [errRePass, setReErrPass] = useState<string>("");
    const [user, setUser] = useState<any>({});
    const [semesters, setSemesters] = useState<Semester[]>();
    const [currentSemester, setCurrentSemesters] = useState<number>();
    const [students, setStudents] = useState<Student[] | []>();
    const [classes, setClasses] = useState<any[]>([]);
    const [errSemester, setErrSemester] = useState<string>();
    const [errSemesterCode, setErrSemesterCode] = useState<string>();
    const [loading, setLoading] = useState<boolean>();
    const [loadingCreateGroup, setLoadingCreateGroup] = useState<boolean>();
    const [semesterCode, setSemesterCode] = useState<string>();
    const [addClassDone, setAddClassDone] = useState<boolean>(false);

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.appInitialization.notifySuccess();
        } else {
            setEntityId("Not in Microsoft Teams");
        }
    }, [inTeams]);

    const callApiGetSemester = async ()=>{
        setLoading(true);
        let appToken : any = localStorage.getItem('appToken')
        await axios.get<object>(
            API_URL+ "api/vnua/semesters/",
            {
                headers: {
                    Accept: 'application/json',
                    Authorization : `Bearer `+ appToken
                },
            },
        ).then((response: any )=>{
            setSemesters(response.data);
            setLoading(false);
        }).catch((e)=>{
            setLoading(false);
            Swal.fire({
                icon: 'error',
                text: 'Có lỗi xảy ra khi lấy danh sách học kỳ!',
            })
        });
    }
    useEffect(() => {
        window.addEventListener("storage", function (ev){
            if (ev.key == 'msToken') {
                window.location.reload();
            }
        });
        microsoftTeams.initialize()
        var authTokenRequest = {
            successCallback: function(result) { console.log("Success: " + result); },
            failureCallback: function(error) { console.log("Error getting token: " + error); }
        };
        microsoftTeams.authentication.getAuthToken(authTokenRequest);
        const params : any = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop: any) => searchParams.get(prop),
        });
        const code = params.code;
        const msEmail = params.email;
        let u : any = localStorage.getItem("currentAuth")
        u = JSON.parse(u)


        if (msEmail){

            if (msEmail !== u.email){
                setCurrentMode(mode.IS_LOGIN)
                Swal.fire({
                    icon: 'error',
                    text: 'Vui lòng đăng nhập đúng tài khoản microsoft',
                }).then(()=>{
                    checkToken()
                })
            }else{
                checkToken()
                if (code){
                    const msTk :any = {
                        token: code,
                        created_at : new Date().getTime()
                    }
                    localStorage.setItem('msToken', JSON.stringify(msTk))
                    window.close()
                }
            }
        }else{
            checkToken()
        }


    }, []);

    const logout = () => {
        localStorage.removeItem('msToken')
        localStorage.removeItem('appToken')
        setLoadingCreateGroup(false)
        setAddClassDone(false)
        setCurrentMode(mode.IS_LOGIN)
    }

    const checkToken = () =>{
        let msToken : any = localStorage.getItem('msToken')
        msToken = JSON.parse(msToken)
        const appToken = localStorage.getItem('appToken')
        if(msToken?.token && (new Date().getTime() - msToken?.created_at > 6000000)){
            localStorage.removeItem('msToken')
        }
        if (!msToken?.token && !_.isEmpty(appToken)){
            setCurrentMode(mode.IS_LOGIN)
            getMsToken()
        }else if (_.isEmpty(appToken) && !msToken?.token){
            setCurrentMode(mode.IS_LOGIN)
        }else if(!_.isEmpty(appToken) && msToken?.token){
            let u : any = localStorage.getItem("currentAuth")
            setUser(JSON.parse(u))
            setCurrentMode(mode.IS_AUTHENCATED)
            callApiGetSemester();
        }
    }

    useEffect(() => {
        setErrSemester("");
    }, [currentSemester]);

    useEffect(() => {
        if (context?.entityId) {
            setEntityId(context.entityId);
        }
    }, [context]);

    const getClasses = async () => {
        setAddClassDone(false)
        let flg = true;
        if (!currentSemester){
            setErrSemester('Vui lòng chọn học kỳ')
            flg = false;
        };
        if (!semesterCode){
            setErrSemesterCode('Vui lòng nhập mã học kỳ')
            flg = false;
        }
        if(flg){
            setLoading(true)
            const params = {
                teacherId : "CNP02",
                semesterId : currentSemester,
            }
            let appToken : any = localStorage.getItem('appToken')
            await axios.post<object>(
                API_URL+ "api/vnua/schedule/",
                params,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization : `Bearer `+ appToken
                    },
                },
            ).then((response:any)=>{
                setLoading(false)
                if (response.data.events.length === 0){
                    Swal.fire({
                        icon: 'error',
                        text: 'Học kì này hiện không có lịch học nào!',
                    })
                }else{
                    setClasses(handleData(response.data.events))
                }
            }).catch((e)=>{
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    text: 'Có lỗi xảy ra khi lấy lịch từ daotao',
                })
            });
        }
    };

    const handleData = (data: any[]): any => {
        data.map((itemP: any, indexP)=>{
            data.map((itemC :any, indexC)=>{
                if (itemP.subjectId == itemC.subjectId && indexP < indexC && itemP.subjectGroup == itemC.subjectGroup){
                    itemC.flgSml=true;
                }
            })
        })
        data = data.filter((item)=>{
            return !item.flgSml
        })
        data.map((item)=>{
            item.description = "";
            item.displayName = getDisplayName(item);
            item.is_check = true;
        })
        return data
    }
    const formatNameSubject = (name) => {
        return name
            .replace(/[áàảạãăắằẳẵặâấầẩẫậ]/gi, 'a')
            .replace(/[éèẻẽẹêếềểễệ]/gi, 'e')
            .replace(/[iíìỉĩị]/gi, 'i')
            .replace(/[óòỏõọôốồổỗộơớờởỡợ]/gi, 'o')
            .replace(/[úùủũụưứừửữự]/gi, 'u')
            .replace(/[ýỳỷỹỵ]/gi, 'y')
            .replace(/[đ]/gi, 'd')
            .replace(/[`~!@#\\$%^&*()+=,.\\?><'":;_]/gi, '')
            .replace(/\s+/gi, ' ')
            .replace(/-+/gi, '-');
    }
    const getDisplayName = (data) => {
        const subjectName = formatNameSubject(data.subjectName)
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        const semesterText = semesters?.filter((item) => {
            return String(item.id) === String(currentSemester);
        })[0].name;
        const subjectGroup = `0${data.subjectGroup}`;
        const semester = String(semesterText).slice(7, 8);
        const semesterStartYear = String(semesterText).slice(21, 23);
        const semesterEndYear = String(semesterText).slice(26, 28);
        return `${semesterCode}-${data.subjectId}-${subjectName}-${subjectGroup}-HK${semester}-${semesterStartYear}-${semesterEndYear}`;
    }

    const getStudent = (id: number) => {
        const thisClass = classes?.find(item => item.id === id);
        if (thisClass) {
            setStudents(thisClass.students);
        }
    };

    const handleCreateGroup = async () =>{
        let msToken : any = localStorage.getItem('msToken')
        let appToken : any = localStorage.getItem('appToken')
        msToken = JSON.parse(msToken)
        if (!msToken){
            console.log('hết token')
            window.location.reload();
        }else{
            console.log('con token')
            setLoadingCreateGroup(true)
            let newClasses : any[] = [];
            for(let item of classes){
                let lstUser : string[]= [];
                item.students.value.map((itemC)=>{
                    lstUser.push(String(itemC.id )+ "@sv.vnua.edu.vn")
                })
                item.users = lstUser
                let itemParams = {
                    token: msToken.token,
                    data: [item]
                }
                try {
                    await axios.post<object>(
                        API_URL+ "api/msteam/main/",
                        itemParams,
                        {
                            headers: {
                                Accept: 'application/json',
                                Authorization : `Bearer `+ appToken
                            },
                        },
                    )
                    item.statusAdd = true;
                    setCountDone(countDone + 1)
                    newClasses.push(item)

                } catch (e) {
                    if (e.response?.status === 403) {
                        setLoading(false);
                        setAddClassDone(true);
                        Swal.fire({
                            icon: 'error',
                            text: "Đã hết phiên làm việc. Vui lòng đăng nhập lại",
                        })
                        logout()
                        return;
                    }
                    item.statusAdd = false;
                    item.msgError = e.response.data;
                    setCountError(countError + 1)
                    newClasses.push(item)
                }
            }
            setLoadingCreateGroup(false)
            setAddClassDone(true)
            await setClasses(newClasses)
        }
    }


    useEffect(() => {
        setTeacherCode("")
        setPassword("")
        setRePassword("")
        setEmail("")
        setErrEmail("")
        setErrPass("")
        setErrTeacherCode("")
        setReErrPass("")
    }, [curentMode]);

    useEffect(() => {
        if (context) {
            setEntityId(context?.entityId);
        }
    }, [context]);

    useEffect(() => {
        setErrTeacherCode("");
    }, [teacherCode]);

    useEffect(() => {
        setErrEmail("");
    }, [email]);

    useEffect(() => {
        setErrPass("");
    }, [password]);

    useEffect(() => {
        setReErrPass("");
    }, [rePassword]);
    useEffect(() => {
        setErrSemesterCode("");
    }, [semesterCode]);

    const handleLogin = async () => {
        let flg = true;
        if(email?.length === 0){
            setErrEmail("Vui lòng nhập email");
            flg = false;
        }else if(!email?.includes("@vnua.edu.vn")){
            setErrEmail("Vui lòng nhập email đúng định dạng");
            flg = false;
        }
        if(password?.length === 0){
            setErrPass("Vui lòng nhập mật khẩu");
            flg = false;
        }
        if(flg){
            const params = {
                email : email,
                password: password,
            }
            await axios.post<object>(
                API_URL + "api/auth/app-login/",
                params,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            ).then((response:any)=>{
                localStorage.setItem('currentAuth', JSON.stringify(response?.data.user))
                localStorage.setItem('appToken', response?.data.accessToken)
                const msToken = localStorage.getItem('msToken')
                if (!msToken){
                    getMsToken()
                }else{
                    let u : any = localStorage.getItem("currentAuth")
                    setUser(JSON.parse(u))
                    setCurrentMode(mode.IS_AUTHENCATED)
                    callApiGetSemester();
                }
            }).catch(()=>{
                Swal.fire({
                    icon: 'error',
                    text: "Đăng nhập thất bại",
                })
            });
        }
    };

    const getMsToken = async () => {
        let appToken : any = localStorage.getItem('appToken')
        const preUrl = window.location.href;
        localStorage.setItem('preUrl', preUrl);
        await axios.get<object>(
            API_URL + "api/msteam/signin",
            {
                headers: {
                    Accept: 'application/json',
                    Authorization : `Bearer `+ appToken
                },
            },
        ).then((res: any)=>{
            window.open(res.data);
        }).catch((e)=>{
            Swal.fire({
                icon: 'error',
                text: "Có lỗi xảy ra khi app cố kết nối tới Microsoft!",
            })
        })
    }

    const handleRegister = async () => {
        let flg = true;
        if(teacherCode?.length === 0){
            setErrTeacherCode("Vui lòng nhập mã giảng viên");
            flg = false;
        }
        if(password?.length === 0){
            setErrPass("Vui lòng nhập mật khẩu");
            flg = false;
        }
        if(rePassword?.length === 0){
            setReErrPass("Vui lòng xác nhận mật khẩu");
            flg = false;
        }else if(rePassword !== password){
            setReErrPass("Mật khẩu chưa khớp");
            flg = false;
        }
        if(email?.length === 0){
            setErrEmail("Vui lòng nhập email");
            flg = false;
        }else if(!email?.includes("@vnua.edu.vn")){
            setErrEmail("Vui lòng nhập email đúng định dạng");
            flg = false;
        }
        if(flg){
            const params = {
                teacherId : teacherCode,
                password: password,
                email: email
            }
            await axios.post<object>(
                API_URL+ "api/auth/register/",
                params,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            ).then(()=>{
                Swal.fire("Tạo tài khoản thành công");
                setCurrentMode(mode.IS_LOGIN)
            }).catch(()=>{
                Swal.fire({
                    icon: 'error',
                    text: "Tạo tài khoản thất bại",
                })
            });
        }
    }
    /**
     * The render() method to create the UI of the tab
     */
    return (
        <ReduxProvider store={store}>
            <Provider theme={theme}>
                {
                    (curentMode === 1) && (loadingCreateGroup) &&(
                        <div className={"loadWrap"}>
                            <div className={"loadContainer"}>
                                <img src="../assets/wait.png" alt="" className="wait"/>
                                <div className={'pending'}>
                                    <div className={'run'}>
                                    </div>
                                </div>
                                <div className={'txtLoad'}>
                                    Quá trình tạo nhóm lớp có thể kéo dài trung bình 1 phút / lớp
                                    <br/> Vui lòng không thao tác trong quá trình chờ hệ thống tạo.
                                </div>
                                <div className={'progressWrap'}>
                                    <p className={'numberProgress'}>{countDone + countError}/{classes?.length}</p>
                                    <div className={'progress'}>
                                        <div className={'done'} style={{width: `${(countDone + countError)/classes?.length}%`}}>
                                        </div>
                                    </div>
                                    <div className={'progressTxt'}>
                                        <div className={'item'}>
                                            <img src="../assets/iconDone.png" alt="" className="icon"/>
                                            {countDone}/{classes?.length}
                                        </div>
                                        <div className={'item'}>
                                            <img src="../assets/iconError.png" alt="" className="icon"/>
                                            {countError}/{classes?.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className="mainWrap">
                    {
                        (curentMode === 1) && (
                            <div className={"containerWrap"}>
                                <div className="header">
                                    <div className="logoWrap">
                                        <img src="../assets/logo.png" alt="" className="logoVnua"/>
                                        <div className="titlePage">
                                            HỌC VIỆN NÔNG NGHIỆP VIỆT NAM
                                        </div>
                                    </div>
                                    <div className={'profileInf'}>
                                        <div className={'inf'}>
                                            <p>Bộ Môn Công Nghệ Phần Mềm - CNP02</p>
                                            <p>stdse@vnua.edu.vn</p>
                                        </div>
                                        <div className={'out'} onClick={() => logout()}>
                                            <img src="../assets/logout.png" alt="" className="logout"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="teacherCodeContainer">
                                        <select className={'select'} onChange={(e) => setCurrentSemesters(parseInt(e.target.value))}>
                                            <option value="0">Chọn học kỳ</option>
                                            {
                                                semesters?.map((item: Semester) => (
                                                    <option value={item.id} key={item.id}>{item.name}</option>
                                                ))
                                            }
                                        </select>
                                        <div className="err">{errSemester}</div>
                                        <input className="inputSemesterCode" placeholder={"Mã học kỳ"} onChange={(e: React.FormEvent<HTMLInputElement>) => setSemesterCode(e.currentTarget.value)}/>
                                        <div className="err">{errSemesterCode}</div>
                                        <Button className={'buttonMain'} primary content="Tìm kiếm lịch" onClick={() => getClasses()}/>
                                    </div>
                                    <div className={'tableWrap'}>

                                    {
                                        (classes?.length > 0) && (
                                            <>
                                                <div  className="tableMain">
                                                    <table cellSpacing={0}>
                                                        <tr>
                                                            <th>STT</th>
                                                            <th>Tên nhóm lớp</th>
                                                            <th>Tên môn học</th>
                                                            <th>Tên lớp</th>
                                                            <th>Nhóm</th>
                                                            <th></th>
                                                            {
                                                                (addClassDone) && (
                                                                    <th>Trạng thái</th>
                                                                )
                                                            }
                                                        </tr>
                                                        {
                                                            classes?.map((thisClass: any, index) => (
                                                                <tr key={thisClass.id}>
                                                                    <td>{index + 1}</td>
                                                                    <td className="txt-center">
                                                                        <Input value={thisClass.displayName} className={"inputClass"}/>
                                                                    </td>
                                                                    <td>{thisClass.subjectName}</td>
                                                                    <td className="txt-center">{thisClass.classCodes}</td>
                                                                    <td className="txt-center">{thisClass.subjectGroup}</td>
                                                                    <td>
                                                                        <Dialog
                                                                            confirmButton="Đóng"
                                                                            content={{
                                                                                content: (
                                                                                    <div className="dialogStudents">
                                                                                        <table className="tableStudents">
                                                                                            <tr>
                                                                                                <th className="txt-center">STT</th>
                                                                                                <th className="txt-center">MSV</th>
                                                                                                <th className="txt-center">Họ và tên</th>
                                                                                            </tr>
                                                                                            {
                                                                                                (thisClass.students.value.length > 0)&& (
                                                                                                    <>
                                                                                                        {
                                                                                                            thisClass.students.value.map((student, indexStudent) => (
                                                                                                                <tr key={indexStudent}>
                                                                                                                    <td className="txt-center">{indexStudent + 1}</td>
                                                                                                                    <td className="txt-center">{student.id}</td>
                                                                                                                    <td className="pd-50">{student.name}</td>
                                                                                                                </tr>
                                                                                                            ))
                                                                                                        }
                                                                                                    </>
                                                                                                )
                                                                                            }
                                                                                        </table>
                                                                                    </div>
                                                                                ),
                                                                                styles: {
                                                                                    // keep only 1 scrollbar while zooming
                                                                                    height: "100%",
                                                                                    maxHeight: "250px",
                                                                                    overflow: "auto"
                                                                                }
                                                                            }}
                                                                            header={"Danh sách sinh viên lớp "+thisClass.subjectName+" nhóm " + thisClass.subjectGroup}
                                                                            trigger={<Button icon={<ListIcon />} text primary content="Danh sách sinh viên" onClick={() => getStudent(thisClass.id)}/>}
                                                                        />

                                                                    </td>
                                                                    {
                                                                        (addClassDone) && (
                                                                            <td>
                                                                                {
                                                                                    (thisClass.statusAdd) && (
                                                                                        <span className={"textDone"}>Thành công</span>
                                                                                    )
                                                                                }
                                                                                {
                                                                                    (!thisClass.statusAdd) && (
                                                                                        <span className={"textError"}>{thisClass.msgError}</span>
                                                                                    )
                                                                                }
                                                                            </td>
                                                                        )
                                                                    }
                                                                </tr>
                                                            ))
                                                        }
                                                    </table>
                                                </div>
                                                <div className="buttonWrap">
                                                    <Button className={'buttonMain'} icon={<TeamCreateIcon />} onClick={()=>handleCreateGroup()} content="Tạo nhóm" primary />
                                                </div>
                                            </>
                                        )
                                    }
                                        {
                                            (classes?.length === 0) && (
                                                <div className={'nodataWrap'}>
                                                    <img src="../assets/nodata.png" alt="" className="logoVnua"/>
                                                    <div className={'nodataText'}>Vui lòng chọn học kì và nhập mã học kì chính xác để tìm kiếm lịch </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        (curentMode === 2) && (
                            <div className="loginLayout">
                                <img src="../assets/bg.jpg" alt="" className="background"/>
                                <div className="loginWrap">
                                <div className="loginContainer">
                                    <img src="../assets/logo.png" alt="" className="logoLogin"/>
                                    <div className="itemField">
                                        <div className="inputField">
                                            <Input placeholder={"Email: abc@vnua.edu.vn"} required={true} onChange={(e: React.FormEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}/>
                                            {
                                                (errEmail?.length > 0) && (
                                                    <div className={'err'}>{errEmail}</div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div className="itemField">
                                        <div className="inputField">
                                            <Input placeholder={"Mật khẩu"} type="password" onChange={(e: React.FormEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}/>
                                            {
                                                (errPass?.length > 0) && (
                                                    <div className={'err'}>{errPass}</div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div className="buttonLoginWrap">
                                        <Button className={'inactive'} text content="Bạn chưa có tài khoản?" onClick={() => setCurrentMode(mode.IS_REGISTER)}/>
                                        <Button  className={'active'} primary content="Đăng nhập" onClick={() => handleLogin()}/>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        (curentMode === 3) && (
                            <div className="loginLayout">
                                <img src="../assets/bg.jpg" alt="" className="background"/>
                                <div className="registerWrap">
                                    <div className="loginContainer">
                                        <img src="../assets/logo.png" alt="" className="logoLogin"/>
                                        <div className="itemField">
                                            <div className="inputField">
                                                <Input placeholder={'Mã giảng viên'} onChange={(e: React.FormEvent<HTMLInputElement>) => setTeacherCode(e.currentTarget.value)}/>
                                                {
                                                    (errTeacherCode?.length > 0) && (
                                                        <div className={'err'}>{errTeacherCode}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="itemField">
                                            <div className="inputField">
                                                <Input  placeholder={"Email: abc@vnua.edu.vn"} onChange={(e: React.FormEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}/>
                                                {
                                                    (errEmail?.length > 0) && (
                                                        <div className={'err'}>{errEmail}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="itemField">
                                            <div className="inputField">
                                                <Input  type="password"  placeholder={"Mật khẩu"}  onChange={(e: React.FormEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}/>
                                                {
                                                    (errPass?.length > 0) && (
                                                        <div className={'err'}>{errPass}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="itemField">
                                            <div className="inputField">
                                                <Input type="password"  placeholder={"Xác nhận mật khẩu "}  onChange={(e: React.FormEvent<HTMLInputElement>) => setRePassword(e.currentTarget.value)}/>
                                                {
                                                    (errRePass?.length > 0) && (
                                                        <div className={'err'}>{errRePass}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="buttonLoginWrap">
                                    <Button text className={'inactive'} content="Bạn đã có tài khoản?" onClick={() => setCurrentMode(mode.IS_LOGIN)}/>
                                    <Button primary className={'active'} content="Đăng ký" onClick={() => handleRegister()}/>
                                </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>

            </Provider>
        </ReduxProvider>
    );
};
