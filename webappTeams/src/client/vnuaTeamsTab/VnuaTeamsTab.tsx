import * as React from "react";
import {Provider, Button, Input, Dialog, Design} from "@fluentui/react-northstar";
import {useState, useEffect} from "react";
import {useTeams} from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import {Student} from "./../../types/Student";
import {Semester} from "../../types/Semester";
import {ListIcon, TeamCreateIcon} from "@fluentui/react-icons-northstar";
import Swal from 'sweetalert2'
import axios from "axios";
import {Provider as ReduxProvider} from "react-redux/es/exports";
import {store} from "../client";
import _ from "lodash";
import displayName = Design.displayName;


/**
 * Implementation of the Vnua classes content page
 */

const API_URL = "https://16c0-116-104-51-98.ngrok-free.app/";

const tokenMS = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJlMmM0NGVjMC1iYzEwLTQ1YzAtOGNkNi1kZjhjMmYxMzA5NWUiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vODQ1MTE1ZTctYTljYi00YWRjLWI2ZDMtMTVhMTFkMzUyOTYyL3YyLjAiLCJpYXQiOjE2OTAwMTk2ODcsIm5iZiI6MTY5MDAxOTY4NywiZXhwIjoxNjkwMDI0OTE1LCJhaW8iOiJBV1FBbS84VEFBQUEwMTl0NGcvcGFEOCtLWE5IbWVKOGx5dG9sZ0lKOTBKeFlLN3ZNdG1Ua0QxS3dwWHJhaVl3dlpIV09KSW5iemxwTnZhczdIQXlKTC9hMElwYUhwaFJiM1RxZ2ZIdGtJc2VWa09sNElrZzNLcFZnVjhpWlBDRzA2bmRhYjJtbEZNRCIsImF6cCI6IjVlM2NlNmMwLTJiMWYtNDI4NS04ZDRiLTc1ZWU3ODc4NzM0NiIsImF6cGFjciI6IjAiLCJuYW1lIjoiQuG7mSBtw7RuIENOUE0iLCJvaWQiOiIxMGQ3ZWZkMy1iZmZmLTRiZTUtOTIxOC0zYjNhNDMxNjVlYjEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdGRzZUB2bnVhLmVkdS52biIsInJoIjoiMC5BWElBNXhWUmhNdXAzRXEyMHhXaEhUVXBZc0JPeE9JUXZNQkZqTmJmakM4VENWN0RBSUEuIiwic2NwIjoiYWNjZXNzX2FzX3VzZXIiLCJzdWIiOiJhVlJLNlk5Qk1SMi00SThmMHVuRS1MbkdkN0tpSzFFMDQxNHZPUF81ZWhNIiwidGlkIjoiODQ1MTE1ZTctYTljYi00YWRjLWI2ZDMtMTVhMTFkMzUyOTYyIiwidXRpIjoiV2ZZVU1KbHNmRVdrQzU5RjlKY0NBQSIsInZlciI6IjIuMCJ9.m08qa6HYyiQ-SkCThp67DUapkeUX5fA-jBBiYlNZFWajidSRYEHNBPrl1XXNB7eHRWVc0tJ8aEtCxtCm6iLMXuw7TjF2T_9AUVX6LOJ7_vzLwArx5ZhWSgW-b9RLkuNI8qQezEIjixRVkvTnhSZQDfQcM2V1kAdmw8RVSdmnDW2st4kIKUTJWexFMjgRNEVttGThFEzGH-R5TtlOrmchWhoLQutITySU942hAi_IPk9wSbIhgDERbOwwuG2c7-iLY0MSiwnEoio5QGzn1bbJrQLKcc8JGF4kpxNwcmHDX9Ubt5ys3qMAqZufd2PyJ4lJTnCJduBsiyN6Ke71oxg7Rg"
const mode = {
    IS_AUTHENCATED: 1,
    IS_REGISTER: 2
};
export const VnuaTeamsTab = () => {
    const [{inTeams, theme}] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [teacherCode, setTeacherCode] = useState<string | undefined>();
    const [curentMode, setCurrentMode] = useState<Number>(mode.IS_REGISTER);
    const [countDone, setCountDone] = useState<number>(0);
    const [countError, setCountError] = useState<number>(0);
    const [errTeacherCode, setErrTeacherCode] = useState<string>("");
    const [appToken, setAppToken] = useState<string>('');
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

    const callApiGetSemester = async (token) => {
        setLoading(true);
        await axios.get<object>(
            API_URL + "api/vnua/semesters/",
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ` + token
                },
            },
        ).then((response: any) => {
            setSemesters(response.data);
            setLoading(false);
        }).catch((e) => {
            setLoading(false);
            Swal.fire({
                icon: 'error',
                text: 'Có lỗi xảy ra khi lấy danh sách học kỳ!',
            })
        });
    }
    useEffect(() => {
        const authTokenRequest = {
            successCallback: function (result) {
                microsoftTeams.app.getContext().then((context: any) => {
                    const tenantId = context.user.tenant.id;
                    setLoading(true)
                    axios.post<object>(
                        API_URL + "api/msteam/me/",
                        {
                            token: result,
                            tenantId
                        },
                        {
                            headers: {
                                Accept: 'application/json',
                            },
                        },
                    ).then((response: any) => {
                        setLoading(false);
                        setUser(response.data.msTeamInfo)
                        setAppToken(response.data.accessToken)
                        if (response.data.teacherId) {
                            setTeacherCode(response.data.teacherId)
                            setCurrentMode(mode.IS_AUTHENCATED)
                            callApiGetSemester(response.data.accessToken)
                        } else {
                            setCurrentMode(mode.IS_REGISTER)
                        }
                    }).catch((e) => {
                        setLoading(false);
                        setCurrentMode(mode.IS_REGISTER)
                        Swal.fire({
                            icon: 'error',
                            text: 'Có lỗi xảy ra khi lấy thông tin người dùng',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        })
                    });
                })
            },
            failureCallback: function (error) {
                console.log("Error getting token: " + error);
            }
        }
        Promise.all([
            microsoftTeams.initialize(),
            microsoftTeams.authentication.getAuthToken(authTokenRequest),
        ])
    }, []);

    useEffect(() => {
        setErrSemester("");
    }, [currentSemester]);


    const getClasses = async () => {
        setAddClassDone(false)
        let flg = true;
        if (!currentSemester) {
            setErrSemester('Vui lòng chọn học kỳ')
            flg = false;
        }
        ;
        if (!semesterCode) {
            setErrSemesterCode('Vui lòng nhập mã học kỳ')
            flg = false;
        }
        if (flg) {
            setLoading(true)
            const params = {
                teacherId: "CNP02",
                semesterId: currentSemester,
            }
            await axios.post<object>(
                API_URL + "api/vnua/schedule/",
                params,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ` + appToken
                    },
                },
            ).then((response: any) => {
                setLoading(false)
                if (response.data.events.length === 0) {
                    Swal.fire({
                        icon: 'error',
                        text: 'Học kì này hiện không có lịch học nào!',
                    })
                } else {
                    setClasses(handleData(response.data.events))
                }
            }).catch((e) => {
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    text: 'Có lỗi xảy ra khi lấy lịch từ daotao',
                })
            });
        }
    };

    const handleData = (data: any[]): any => {
        data.map((itemP: any, indexP) => {
            data.map((itemC: any, indexC) => {
                if (itemP.subjectId == itemC.subjectId && indexP < indexC && itemP.subjectGroup == itemC.subjectGroup) {
                    itemC.flgSml = true;
                }
            })
        })
        data = data.filter((item) => {
            return !item.flgSml
        })
        data.map((item) => {
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

    const handleCreateGroup = async () => {
        let msToken: any = localStorage.getItem('msToken')
        msToken = JSON.parse(msToken)
        if (!msToken) {
            console.log('hết token')
            window.location.reload();
        } else {
            console.log('con token')
            setLoadingCreateGroup(true)
            let newClasses: any[] = [];
            for (let item of classes) {
                let lstUser: string[] = [];
                item.students.value.map((itemC) => {
                    lstUser.push(String(itemC.id) + "@sv.vnua.edu.vn")
                })
                item.users = lstUser
                let itemParams = {
                    token: msToken.token,
                    data: [item]
                }
                try {
                    await axios.post<object>(
                        API_URL + "api/msteam/main/",
                        itemParams,
                        {
                            headers: {
                                Accept: 'application/json',
                                Authorization: `Bearer ` + appToken
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
        setErrTeacherCode("")
    }, [curentMode]);

    useEffect(() => {
        setErrTeacherCode("");
    }, [teacherCode]);

    useEffect(() => {
        setErrSemesterCode("");
    }, [semesterCode]);

    const handlePressTeacherCode = e => {
        if (e.key === 'Enter') {
            handleRegister()
        }
    }

    const handleRegister = async () => {
        let flg = true;
        if (teacherCode?.length === 0) {
            setErrTeacherCode("Vui lòng nhập mã giảng viên");
            flg = false;
        }
        if (flg) {
            const params = {
                teacherId: teacherCode,
                email: user.mail
            }
            await axios.post<object>(
                API_URL + "api/users/" + user.id,
                params,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ` + appToken
                    },
                },
            ).then(() => {
                Swal.fire("Đăng ký mã giảng viên thành công");
                setCurrentMode(mode.IS_AUTHENCATED)
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    text: "Có lỗi khi đăng ký mã giảng viên",
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
                    (curentMode === mode.IS_AUTHENCATED) && (loadingCreateGroup) && (
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
                                        <div className={'done'}
                                             style={{width: `${(countDone + countError) / classes?.length}%`}}>
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
                        (curentMode === mode.IS_AUTHENCATED) && (
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
                                            <p>{user.displayName} - CNP02</p>
                                            <p>{user.mail}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="teacherCodeContainer">
                                        <select className={'select'}
                                                onChange={(e) => setCurrentSemesters(parseInt(e.target.value))}>
                                            <option value="0">Chọn học kỳ</option>
                                            {
                                                semesters?.map((item: Semester) => (
                                                    <option value={item.id} key={item.id}>{item.name}</option>
                                                ))
                                            }
                                        </select>
                                        <div className="err">{errSemester}</div>
                                        <input className="inputSemesterCode" placeholder={"Mã học kỳ"}
                                               onChange={(e: React.FormEvent<HTMLInputElement>) => setSemesterCode(e.currentTarget.value)}/>
                                        <div className="err">{errSemesterCode}</div>
                                        <Button className={'buttonMain'} primary content="Tìm kiếm lịch"
                                                onClick={() => getClasses()}/>
                                    </div>
                                    <div className={'tableWrap'}>

                                        {
                                            (classes?.length > 0) && (
                                                <>
                                                    <div className="tableMain">
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
                                                                            <Input value={thisClass.displayName}
                                                                                   className={"inputClass"}/>
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
                                                                                            <table
                                                                                                className="tableStudents">
                                                                                                <tr>
                                                                                                    <th className="txt-center">STT</th>
                                                                                                    <th className="txt-center">MSV</th>
                                                                                                    <th className="txt-center">Họ
                                                                                                        và tên
                                                                                                    </th>
                                                                                                </tr>
                                                                                                {
                                                                                                    (thisClass.students.value.length > 0) && (
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
                                                                                header={"Danh sách sinh viên lớp " + thisClass.subjectName + " nhóm " + thisClass.subjectGroup}
                                                                                trigger={<Button icon={<ListIcon/>} text
                                                                                                 primary
                                                                                                 content="Danh sách sinh viên"
                                                                                                 onClick={() => getStudent(thisClass.id)}/>}
                                                                            />

                                                                        </td>
                                                                        {
                                                                            (addClassDone) && (
                                                                                <td>
                                                                                    {
                                                                                        (thisClass.statusAdd) && (
                                                                                            <span
                                                                                                className={"textDone"}>Thành công</span>
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        (!thisClass.statusAdd) && (
                                                                                            <span
                                                                                                className={"textError"}>{thisClass.msgError}</span>
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
                                                        <Button className={'buttonMain'} icon={<TeamCreateIcon/>}
                                                                onClick={() => handleCreateGroup()} content="Tạo nhóm"
                                                                primary/>
                                                    </div>
                                                </>
                                            )
                                        }
                                        {
                                            (classes?.length === 0) && (
                                                <div className={'nodataWrap'}>
                                                    <img src="../assets/nodata.png" alt="" className="logoVnua"/>
                                                    <div className={'nodataText'}>Vui lòng chọn học kì và nhập mã học kì
                                                        chính xác để tìm kiếm lịch
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        (curentMode === mode.IS_REGISTER) && (
                            <div className="loginLayout">
                                <img src="../assets/bg.jpg" alt="" className="background"/>
                                <div className="registerWrap">
                                    <div className="loginContainer">
                                        <img src="../assets/logo.png" alt="" className="logoLogin"/>
                                        <div className="itemField">
                                            <div className="inputField">
                                                <Input placeholder={'Mã giảng viên'}
                                                       onKeyPress={(e: React.FormEvent<HTMLInputElement>) => handlePressTeacherCode(e)}
                                                       onChange={(e: React.FormEvent<HTMLInputElement>) => setTeacherCode(e.currentTarget.value)}/>
                                                {
                                                    (errTeacherCode?.length > 0) && (
                                                        <div className={'err'}>{errTeacherCode}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="buttonLoginWrap">
                                            <Button primary className={'active'} content="Cập nhật mã giảng viên"
                                                    onClick={() => handleRegister()}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        (loading) && (
                            <div className={"loadingAll"}>
                                <div className="loader"></div>
                            </div>
                        )
                    }
                </div>

            </Provider>
        </ReduxProvider>
    );
};
