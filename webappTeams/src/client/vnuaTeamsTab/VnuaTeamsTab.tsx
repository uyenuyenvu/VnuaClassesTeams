import * as React from 'react';
import {
  Provider,
  Button,
  Input,
  Dialog,
  Design,
} from '@fluentui/react-northstar';
import { useState, useEffect } from 'react';
import { useTeams } from 'msteams-react-base-component';
import * as microsoftTeams from '@microsoft/teams-js';
import { Student } from './../../types/Student';
import { Semester } from '../../types/Semester';
import { ListIcon, TeamCreateIcon } from '@fluentui/react-icons-northstar';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Provider as ReduxProvider } from 'react-redux/es/exports';
import { store } from '../client';
import _ from 'lodash';
import displayName = Design.displayName;
import {getTokens} from './script'

/**
 * Implementation of the Vnua classes content page
 */

const API_URL = process.env.API_URL;

const mode = {
  IS_AUTHENCATED: 1,
  IS_REGISTER: 2,
};

let tenantId = '';
export const VnuaTeamsTab = () => {
  const [{ inTeams, theme }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [teacherCode, setTeacherCode] = useState<string | undefined>();
  const [curentMode, setCurrentMode] = useState<Number>(mode.IS_REGISTER);
  const [countDone, setCountDone] = useState<number>(0);
  const [countError, setCountError] = useState<number>(0);
  const [errTeacherCode, setErrTeacherCode] = useState<string>('');
  const [appToken, setAppToken] = useState<string>('');
  const [MsToken, setMsToken] = useState<string>('');
  const [user, setUser] = useState<any>({});
  const [userId, setUserId] = useState<any>({});
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
      setEntityId('Not in Microsoft Teams');
    }
  }, [inTeams]);

  const callApiGetSemester = async (token) => {
    setLoading(true);
    await axios
      .get<object>(API_URL + 'api/vnua/semesters/', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ` + token,
        },
      })
      .then((response: any) => {
        setSemesters(response.data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          text: 'Có lỗi xảy ra khi lấy danh sách học kỳ!',
        });
      });
  };

  const getAuthToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      microsoftTeams.authentication.getAuthToken({
        successCallback: resolve,
        failureCallback: reject,
      });
    });
  };

  useEffect(() => {
      (
          async () => {
              microsoftTeams.initialize();
              try {
                  const { authToken, tenantId, email, name } =
                      await getTokens();

                  const { data } = await axios.post<any>(
                      API_URL + 'api/msteam/me/',
                      {
                          authToken,
                          tenantId,
                          email,
                          name,
                      },
                      {
                          headers: {
                              Accept: 'application/json',
                          },
                      }
                  );

                  setLoading(false);
                  setUser({ displayName: name, mail: email });
                  setUserId(data.userId);
                  localStorage.setItem('tenantId', tenantId);
                  localStorage.setItem('authToken', authToken);
                  setAppToken(data.accessToken);
                  console.log(data);

                  if (data.teacherId) {
                      setTeacherCode(data.teacherId);
                      setCurrentMode(mode.IS_AUTHENCATED);
                      callApiGetSemester(data.accessToken);
                  } else {
                      setCurrentMode(mode.IS_REGISTER);
                  }
              } catch (error) {
                  console.error(error);
                  setLoading(false);
                  setCurrentMode(mode.IS_REGISTER);
                  Swal.fire({
                      icon: 'error',
                      text: 'Có lỗi xảy ra khi lấy thông tin người dùng',
                      showConfirmButton: false,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                  });
              }
          }
      )()
  }, []);

  useEffect(() => {
    setErrSemester('');
  }, [currentSemester]);

  const getClasses = async () => {
    setAddClassDone(false);
    let flg = true;
    if (!currentSemester) {
      setErrSemester('Vui lòng chọn học kỳ');
      flg = false;
    }
    if (flg) {
      setLoading(true);
      const params = {
        teacherId: teacherCode,
        semesterId: currentSemester,
      };
      await axios
        .post<object>(API_URL + 'api/vnua/schedule/', params, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ` + appToken,
          },
        })
        .then((response: any) => {
          setLoading(false);
          if (response.data.events.length === 0) {
            Swal.fire({
              icon: 'error',
              text: 'Học kì này hiện không có lịch học nào!',
            });
          } else {
            setClasses(handleData(response.data.events));
          }
        })
        .catch((e) => {
          setLoading(false);
          Swal.fire({
            icon: 'error',
            text: 'Có lỗi xảy ra khi lấy lịch từ daotao',
          });
        });
    }
  };

  const handleData = (data: any[]): any => {
    data.map((itemP: any, indexP) => {
      data.map((itemC: any, indexC) => {
        if (
          itemP.subjectId == itemC.subjectId &&
          indexP < indexC &&
          itemP.subjectGroup == itemC.subjectGroup
        ) {
          itemC.flgSml = true;
        }
      });
    });
    data = data.filter((item) => {
      return !item.flgSml;
    });
    data.map((item) => {
      item.description = '';
      item.displayName = getDisplayName(item);
      item.hasMeetingEvent = true;
    });
    return data;
  };
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
  };
  const getDisplayName = (data) => {
    const subjectName = formatNameSubject(data.subjectName)
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const semesterText = semesters?.filter((item) => {
      return String(item.id) === String(currentSemester);
    })[0].name;
    const subjectGroup = data.subjectGroup < 10 ? `0${data.subjectGroup}` : data.subjectGroup;
    const semester = String(semesterText).slice(7, 8);
    const semesterStartYear = String(semesterText).slice(21, 23);
    const semesterEndYear = String(semesterText).slice(26, 28);
    if (semesterCode)
      return `${semesterCode}-${data.subjectId}-${subjectName}-${subjectGroup}-HK${semester}-${semesterStartYear}-${semesterEndYear}`;
    return `${data.subjectId}-${subjectName}-${subjectGroup}-HK${semester}-${semesterStartYear}-${semesterEndYear}`;
  };

  const getStudent = (id: number) => {
    const thisClass = classes?.find((item) => item.id === id);
    if (thisClass) {
      setStudents(thisClass.students);
    }
  };

  const handleCreateGroup = async () => {
    setLoadingCreateGroup(true);
    let newClasses: any[] = [];
    for (let item of classes) {
      let lstUser: string[] = [];
      item.students.value.map((itemC) => {
        lstUser.push(String(itemC.id) + '@sv.vnua.edu.vn');
      });
      item.users = lstUser;
      let itemParams = {
        token: localStorage.getItem('authToken'),
        tenantId: localStorage.getItem('tenantId'),
        data: [item],
      };
      try {
        await axios.post<object>(API_URL + 'api/msteam/main/', itemParams, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ` + appToken,
          },
        });
        item.statusAdd = true;
        setCountDone(countDone + 1);
        newClasses.push(item);
      } catch (e) {
        if (e.response?.status === 403) {
          setLoading(false);
          setAddClassDone(true);
          Swal.fire({
            icon: 'error',
            text: 'Đã hết phiên làm việc. Vui lòng đăng nhập lại',
          });
          return;
        }
        item.statusAdd = false;
        item.msgError = e.response.data;
        setCountError(countError + 1);
        newClasses.push(item);
      }
    }
    setLoadingCreateGroup(false);
    setAddClassDone(true);
    await setClasses(newClasses);
  };

  useEffect(() => {
    setErrTeacherCode('');
  }, [teacherCode]);

  useEffect(() => {
    setErrSemesterCode('');
  }, [semesterCode]);

  const handlePressTeacherCode = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    let flg = true;
    if (teacherCode?.length === 0) {
      setErrTeacherCode('Vui lòng nhập mã giảng viên');
      flg = false;
    }
    if (flg) {
      const params = {
        teacherId: teacherCode,
        email: user.mail,
        userId: userId,
      };
      await axios
        .post<object>(API_URL + 'api/users/' + userId, params, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ` + appToken,
          },
        })
        .then(() => {
          Swal.fire('Đăng ký mã giảng viên thành công');
          setCurrentMode(mode.IS_AUTHENCATED);
          callApiGetSemester(appToken);
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            text: 'Có lỗi khi đăng ký mã giảng viên',
          });
        });
    }
  };
  /**
   * The render() method to create the UI of the tab
   */
  return (
    <ReduxProvider store={store}>
      <Provider theme={theme}>
        {curentMode === mode.IS_AUTHENCATED && loadingCreateGroup && (
          <div className={'loadWrap'}>
            <div className={'loadContainer'}>
              <img src='../assets/wait.png' alt='' className='wait' />
              <div className={'pending'}>
                <div className={'run'}></div>
              </div>
              <div className={'txtLoad'}>
                Quá trình tạo nhóm lớp có thể kéo dài trung bình 1 phút / lớp
                <br /> Vui lòng không thao tác trong quá trình chờ hệ thống tạo.
              </div>
              <div className={'progressWrap'}>
                <p className={'numberProgress'}>
                  {countDone + countError}/{classes?.length}
                </p>
                <div className={'progress'}>
                  <div
                    className={'done'}
                    style={{
                      width: `${(countDone + countError) / classes?.length}%`,
                    }}
                  ></div>
                </div>
                <div className={'progressTxt'}>
                  <div className={'item'}>
                    <img src='../assets/iconDone.png' alt='' className='icon' />
                    {countDone}/{classes?.length}
                  </div>
                  <div className={'item'}>
                    <img
                      src='../assets/iconError.png'
                      alt=''
                      className='icon'
                    />
                    {countError}/{classes?.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className='mainWrap'>
          {curentMode === mode.IS_AUTHENCATED && (
            <div className={'containerWrap'}>
              <div className='header'>
                <div className='logoWrap'>
                  <img src='../assets/logo.png' alt='' className='logoVnua' />
                  <div className='titlePage'>HỌC VIỆN NÔNG NGHIỆP VIỆT NAM</div>
                </div>
                <div className={'profileInf'}>
                  <div className={'inf'}>
                    <p>
                      {user.displayName} - {teacherCode}
                    </p>
                    <p>{user.mail}</p>
                      <Button
                          className={'buttonMain'}
                          primary
                          content='Cập nhật mã giảng viên'
                          onClick={() => setCurrentMode(mode.IS_REGISTER)}
                      />
                  </div>
                </div>
              </div>
              <div className='content'>
                <div className='teacherCodeContainer'>
                  <select
                    className={'select'}
                    onChange={(e) =>
                      setCurrentSemesters(parseInt(e.target.value))
                    }
                  >
                    <option value='0'>Chọn học kỳ</option>
                    {semesters?.map((item: Semester) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <div className='err'>{errSemester}</div>
                  <input
                    className='inputSemesterCode'
                    placeholder={'Mã học kỳ'}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setSemesterCode(e.currentTarget.value)
                    }
                  />
                  <Button
                    className={'buttonMain'}
                    primary
                    content='Lấy lịch học'
                    onClick={() => getClasses()}
                  />
                </div>
                <div className={'tableWrap'}>
                  {classes?.length > 0 && (
                    <>
                      <div className='tableMain'>
                        <table cellSpacing={0}>
                          <tr>
                              <th>STT</th>
                            <th>Tên nhóm lớp</th>
                            <th>Tên môn học</th>
                            <th>Tên lớp</th>
                            <th>Nhóm</th>

                              <th
                                  style={{
                                      width: 'auto',
                                  }}
                              >
                                  Tạo lịch online
                              </th>
                            <th></th>
                            {addClassDone && <th>Trạng thái</th>}
                          </tr>
                          {classes?.map((thisClass: any, index) => (
                            <tr key={thisClass.id}>
                              <td>{index + 1}</td>
                              <td className='txt-center '>
                                <div className='flex'>
                                  <input
                                    value={thisClass.displayName}
                                    onChange={(e) => {
                                      classes[index].displayName =
                                        e.target.value;
                                    }}
                                    className={'inputClass'}
                                  />
                                  <img
                                    src='../assets/pencial.svg'
                                    alt=''
                                    className='iconPencial'
                                  />
                                </div>
                              </td>
                              <td>{thisClass.subjectName}</td>
                              <td className='txt-center'>
                                {thisClass.classCodes}
                              </td>

                              <td className='txt-center'>
                                {thisClass.subjectGroup}
                              </td>

                                <td
                                    style={{
                                        textAlign: 'center',
                                    }}
                                >
                                    <input
                                        style={{
                                            width: 'auto',
                                        }}
                                        type='checkbox'
                                        onChange={(e) => {
                                            classes[index].hasMeetingEvent =
                                                e.target.value;
                                        }}
                                        value={thisClass.hasMeetingEvent}
                                    />
                                </td>
                              <td>
                                <Dialog
                                  confirmButton='Đóng'
                                  content={{
                                    content: (
                                      <div className='dialogStudents'>
                                        <table className='tableStudents'>
                                          <tr>
                                            <th className='txt-center'>STT</th>
                                            <th className='txt-center'>MSV</th>
                                            <th className='txt-center'>
                                              Họ và tên
                                            </th>
                                          </tr>
                                          {thisClass.students.value.length >
                                            0 && (
                                            <>
                                              {thisClass.students.value.map(
                                                (student, indexStudent) => (
                                                  <tr key={indexStudent}>
                                                    <td className='txt-center'>
                                                      {indexStudent + 1}
                                                    </td>
                                                    <td className='txt-center'>
                                                      {student.id}
                                                    </td>
                                                    <td className='pd-50'>
                                                      {student.name}
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </>
                                          )}
                                        </table>
                                      </div>
                                    ),
                                    styles: {
                                      // keep only 1 scrollbar while zooming
                                      height: '100%',
                                      maxHeight: '250px',
                                      overflow: 'auto',
                                    },
                                  }}
                                  header={
                                    'Danh sách sinh viên lớp ' +
                                    thisClass.subjectName +
                                    ' nhóm ' +
                                    thisClass.subjectGroup
                                  }
                                  trigger={
                                    <Button
                                      icon={<ListIcon />}
                                      text
                                      primary
                                      content='Danh sách sinh viên'
                                      onClick={() => getStudent(thisClass.id)}
                                    />
                                  }
                                />
                              </td>
                              {addClassDone && (
                                <td>
                                  {thisClass.statusAdd && (
                                    <span className={'textDone'}>
                                      Thành công
                                    </span>
                                  )}
                                  {!thisClass.statusAdd && (
                                    <span className={'textError'}>
                                      {thisClass.msgError}
                                    </span>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </table>
                      </div>
                      <div className='buttonWrap'>
                        <Button
                          className={'buttonMain'}
                          icon={<TeamCreateIcon />}
                          onClick={() => handleCreateGroup()}
                          content='Tạo nhóm lớp và lịch học online'
                          primary
                        />
                      </div>
                    </>
                  )}
                  {classes?.length === 0 && (
                    <div className={'nodataWrap'}>
                      <img
                        src='../assets/nodata.png'
                        alt=''
                        className='logoVnua'
                      />
                      <div className={'nodataText'}>
                        Vui lòng chọn học kì và nhập mã học kì chính xác để tìm
                        kiếm lịch
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {curentMode === mode.IS_REGISTER && (
            <div className='loginLayout'>
              <img src='../assets/bg.jpg' alt='' className='background' />
              <div className='registerWrap'>
                <div className='loginContainer'>
                  <img src='../assets/logo.png' alt='' className='logoLogin' />
                  <div className='itemField'>
                    <div className='inputField'>
                      <Input
                        placeholder={'Mã giảng viên'}
                        onKeyPress={(e: React.FormEvent<HTMLInputElement>) =>
                          handlePressTeacherCode(e)
                        }
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                          setTeacherCode(e.currentTarget.value)
                        }
                      />
                      {errTeacherCode?.length > 0 && (
                        <div className={'err'}>{errTeacherCode}</div>
                      )}
                    </div>
                  </div>
                  <div className='buttonLoginWrap'>
                    <Button
                      primary
                      className={'active'}
                      content='Cập nhật mã giảng viên'
                      onClick={() => handleRegister()}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div className={'loadingAll'}>
              <div className='loader'></div>
            </div>
          )}
        </div>
      </Provider>
    </ReduxProvider>
  );
};
