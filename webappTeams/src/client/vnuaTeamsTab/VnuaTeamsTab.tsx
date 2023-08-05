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

const API_URL = "https://0d83-14-191-32-232.ngrok-free.app/";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3NmI3MDBlLTc4OGMtNDcxOC04NDY1LTI1NDJjNTI1MzUwNyIsInRlYWNoZXJJZCI6IkNOUDAyIiwibmFtZSI6IkLhu5kgbcO0biBDTlBNIiwiZW1haWwiOiJzdGRzZUB2bnVhLmVkdS52biIsIm1zQWNjZXNzVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKdWIyNWpaU0k2SW1sVFZVcFBVemhIU3pSTmVWQnZZM2hmZFRSeE1XdFVibHBtTTNOWFJFUnBNSFJ4UjJGS05uSjRjM2NpTENKaGJHY2lPaUpTVXpJMU5pSXNJbmcxZENJNklpMUxTVE5ST1c1T1VqZGlVbTltZUcxbFdtOVljV0pJV2tkbGR5SXNJbXRwWkNJNklpMUxTVE5ST1c1T1VqZGlVbTltZUcxbFdtOVljV0pJV2tkbGR5SjkuZXlKaGRXUWlPaUl3TURBd01EQXdNeTB3TURBd0xUQXdNREF0WXpBd01DMHdNREF3TURBd01EQXdNREFpTENKcGMzTWlPaUpvZEhSd2N6b3ZMM04wY3k1M2FXNWtiM2R6TG01bGRDODRORFV4TVRWbE55MWhPV05pTFRSaFpHTXRZalprTXkweE5XRXhNV1F6TlRJNU5qSXZJaXdpYVdGMElqb3hOamt3TURBMk5EWXpMQ0p1WW1ZaU9qRTJPVEF3TURZME5qTXNJbVY0Y0NJNk1UWTVNREF4TVRVeU1Dd2lZV05qZENJNk1Dd2lZV055SWpvaU1TSXNJbUZwYnlJNklrRldVVUZ4THpoVVFVRkJRWFZZYzJsVmRUUlVlV3BaU1RCaVRUZFRVRzE2Y2tSRE4xcG9hMjExTW14WUwyNVdNMUUxT1dWVVdYSkZPV1JHT1RKeE1URXZiVUpyTUdzMVNFVm1VQzl3U0hWdWJrc3dhVGx0VGtaeWFIaFZUSEk0WTFseU5UTktRVVJ2ZFdNMVJGZHRkbEkyZG10dVEzRlZQU0lzSW1GdGNpSTZXeUp3ZDJRaUxDSnRabUVpWFN3aVlYQndYMlJwYzNCc1lYbHVZVzFsSWpvaVZsQklWaUlzSW1Gd2NHbGtJam9pWlRKak5EUmxZekF0WW1NeE1DMDBOV013TFRoalpEWXRaR1k0WXpKbU1UTXdPVFZsSWl3aVlYQndhV1JoWTNJaU9pSXhJaXdpYVdSMGVYQWlPaUoxYzJWeUlpd2lhWEJoWkdSeUlqb2lNVFF1TVRreExqTXpMalV6SWl3aWJtRnRaU0k2SWtMaHU1a2diY08wYmlCRFRsQk5JaXdpYjJsa0lqb2lNVEJrTjJWbVpETXRZbVptWmkwMFltVTFMVGt5TVRndE0ySXpZVFF6TVRZMVpXSXhJaXdpY0d4aGRHWWlPaUl6SWl3aWNIVnBaQ0k2SWpFd01ETXlNREF4UlVNd016QkRNemdpTENKeWFDSTZJakF1UVZoSlFUVjRWbEpvVFhWd00wVnhNakI0VjJoSVZGVndXV2ROUVVGQlFVRkJRVUZCZDBGQlFVRkJRVUZCUVVSRVFVbEJMaUlzSW5OamNDSTZJa05oYkdWdVpHRnljeTVTWldGa1YzSnBkR1VnUTJoaGJtNWxiQzVEY21WaGRHVWdRMmhoYm01bGJFMWxjM05oWjJVdVUyVnVaQ0JIY205MWNDNVNaV0ZrVjNKcGRHVXVRV3hzSUU5dWJHbHVaVTFsWlhScGJtZHpMbEpsWVdSWGNtbDBaU0J2Y0dWdWFXUWdjSEp2Wm1sc1pTQlVaV0Z0TGtOeVpXRjBaU0JVWldGdExsSmxZV1JDWVhOcFl5NUJiR3dnVkdWaGJVMWxiV0psY2k1U1pXRmtWM0pwZEdVdVFXeHNJRlZ6WlhJdVVtVmhaQ0JsYldGcGJDSXNJbk5wWjI1cGJsOXpkR0YwWlNJNld5SnJiWE5wSWwwc0luTjFZaUk2SWxwTmVWSjRVRTQzTFcwdFJsbEdaVEIwUzI0dGJWcG9SRlZpUTBWTmQxbEJOVFZSWDI5VGFWWjRZemdpTENKMFpXNWhiblJmY21WbmFXOXVYM05qYjNCbElqb2lRVk1pTENKMGFXUWlPaUk0TkRVeE1UVmxOeTFoT1dOaUxUUmhaR010WWpaa015MHhOV0V4TVdRek5USTVOaklpTENKMWJtbHhkV1ZmYm1GdFpTSTZJbk4wWkhObFFIWnVkV0V1WldSMUxuWnVJaXdpZFhCdUlqb2ljM1JrYzJWQWRtNTFZUzVsWkhVdWRtNGlMQ0oxZEdraU9pSjVkME5YYTJ4WmJrc3dWMlZzVlVsTGEwUXdPVUZCSWl3aWRtVnlJam9pTVM0d0lpd2lkMmxrY3lJNld5SmlOemxtWW1ZMFpDMHpaV1k1TFRRMk9Ea3RPREUwTXkwM05tSXhPVFJsT0RVMU1Ea2lYU3dpZUcxelgzTjBJanA3SW5OMVlpSTZJbUZXVWtzMldUbENUVkl5TFRSSk9HWXdkVzVGTFV4dVIyUTNTMmxMTVVVd05ERTBkazlRWHpWbGFFMGlmU3dpZUcxelgzUmpaSFFpT2pFME5Ea3hNelF5TkRKOS5vUlAtU3NMNkU1YzFINmZuejc4VGpJWEYxOXpCMHJzb0toN2JuUmdNdF9mZDVVaEplRG1TME56N1dDZkwxUEwteTlkQTRjVEFEZXZLVFlQX1hBbXNzMGdGM1VmekVZUmdiTmx1aUlQclJPay13X0hRalhZakN6cmV4RjhiOE0xb2pwOTRfYVhVTTZ6QUdSNHo2cXlTZHNwQWNpTDdxbzJRZHl0OENpcGpVRXJtd25zUDBqSkRZRi1ObE42cHFOdDNiUjdmY2FLQVRFX1c1UFFBRTEwTDRRVTdQLWNSNU02VGVfMWRRTmZZcUlDb3haWkpXZGNfR3ZuYUhTb0l6U2dpMF9SQmQ3ZEJzQ2ZiT3ltZlZjVDRjb3VCTmMwYVY2enFKX0tRbVhiSzhIY3p3S2hzeHdUVzR2SlVVWlNFZndjYUkwOVQ4Sk9pamo0OXBhRHY5MjdjNFEiLCJtc1JlZnJlc2hUb2tlbiI6IjAuQVhJQTV4VlJoTXVwM0VxMjB4V2hIVFVwWXNCT3hPSVF2TUJGak5iZmpDOFRDVjdEQUlBLkFnQUJBQUVBQUFELS1ETEEzVk83UXJkZGdKZzdXZXZyQWdEc193VUE5UDlVOTRtbWg4dXJZVWFLT3oyOGI5anpvb1hwTGdZTzhWOW1rMnVnNEpwRjdMc2NUNkxpNzFmcXBqZ2FqcERLM1hOTFI5UHdtOFU5QV9LWGR0dnVrX1piMnQzN0R4Nm5ENU93ZFkzZ0pBM1FsTjhsVFB4TWZ3SDQxTWtsWHhmdjJFcEJSRHQwbjBySGQ0UGtpdkdRSFJuUURSN3RxZjEyZzhwLTlzZ0VyTXRzVkI2TzRaTU5BeXFaUEZDb2xnOWpweUdMdFZLV2J4VUtMa3VEZVpTcHhSaWd5cWNrcllsQUtyVHNVd2xZRjdVOWlEbGJ3U3lHNDFfVGFjNjBUNlBsMzV3QlhIVTRaeVp1R0xBclFBemNNSzdvdUdvb3YtSWZvMndBNTFJcE5QQkdPbWhkaENWbWNvaXB0aFFaNmZDWHkyRXMzZ3VHMG1HQllBbG9JaWhyblcxUDNLcmswbks5UHFlNFdqc0h3aWczZ3E3NThoVWV2TzBYcFlqT1pPbldXbmxheG5vVTR3WE04WEl4MjI0ZVdfYmVaNFl6ME5MV01PLVNfTU9EX21nMEVuVWtlT1JmOU5SZDVMYjAyenBubDRNM0k5VVhHMDFfVGJWM0EzVHF0d083cVl1U3RQREpLSnNxc3NkYWZrTGZRc2RMSURfZG5vTlBfZnlYY200VG16LUM1V1FZVW00Rjk2Nm14NkxLT0hVcTdqNkRKWTRCVjQtbFFRQ3A4eUJmWGJ6NFY4WTJQRzh5MjB5b3Faa1NDUWVkTU5NX1M1SU9WY2JXRU95Y2Z1dklldGxhRmJQb3ZvQUU0UEYxczhZQ3hkb3gyQlcwcnpVaXNWVmZNS2VCeVY2TXZoUDlNdWh3Tk5RY0s4THhkMWR1MV9UTU50cDJPaXdmdmNsN05xVDh5T0xjYjVhTHpvbjZTY3c3SkZLeEtRaVRiWUVRQ3I5STZ5TmN6QldZT09nSnRxanF6aVZKeS1ZcmdZRmREMWxtQkxGNHA2Sm00cHpxRERwZkpuQ0NaNHNUUGJ0NjlmUVk1S0FuZkJHSW05V1ltQXIwYWt1aXZaNG4iLCJtc0FjY2Vzc1Rva2VuRXhwaXJlT24iOiIyMDIzLTA3LTIyVDA3OjM4OjM5LjAwMFoiLCJhY2Nlc3NUb2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUowWldGamFHVnlTV1FpT2lKRFRsQXdNaUlzSW01aGJXVWlPaUpDNGJ1WklHM0R0RzRnUTA1UVRTSXNJbVZ0WVdsc0lqb2ljM1JrYzJWQWRtNTFZUzVsWkhVdWRtNGlMQ0p0YzFKbFpuSmxjMmhVYjJ0bGJpSTZiblZzYkN3aWJYTkJZMk5sYzNOVWIydGxia1Y0Y0dseVpVOXVJam9pTWpBeU15MHdOeTB4TmxReE56b3hNem95TXk0d01EQmFJaXdpYlhOQlkyTnZkVzUwU1c1bWJ5STZJbnRjSW1odmJXVkJZMk52ZFc1MFNXUmNJanBjSWpFd1pEZGxabVF6TFdKbVptWXROR0psTlMwNU1qRTRMVE5pTTJFME16RTJOV1ZpTVM0NE5EVXhNVFZsTnkxaE9XTmlMVFJoWkdNdFlqWmtNeTB4TldFeE1XUXpOVEk1TmpKY0lpeGNJbVZ1ZG1seWIyNXRaVzUwWENJNlhDSnNiMmRwYmk1M2FXNWtiM2R6TG01bGRGd2lMRndpZEdWdVlXNTBTV1JjSWpwY0lqZzBOVEV4TldVM0xXRTVZMkl0TkdGa1l5MWlObVF6TFRFMVlURXhaRE0xTWprMk1sd2lMRndpZFhObGNtNWhiV1ZjSWpwY0luTjBaSE5sUUhadWRXRXVaV1IxTG5adVhDSXNYQ0pzYjJOaGJFRmpZMjkxYm5SSlpGd2lPbHdpTVRCa04yVm1aRE10WW1abVppMDBZbVUxTFRreU1UZ3RNMkl6WVRRek1UWTFaV0l4WENJc1hDSnVZVzFsWENJNlhDSkM0YnVaSUczRHRHNGdRMDVRVFZ3aUxGd2lhV1JVYjJ0bGJrTnNZV2x0YzF3aU9udGNJbUYxWkZ3aU9sd2laVEpqTkRSbFl6QXRZbU14TUMwME5XTXdMVGhqWkRZdFpHWTRZekptTVRNd09UVmxYQ0lzWENKcGMzTmNJanBjSW1oMGRIQnpPaTh2Ykc5bmFXNHViV2xqY205emIyWjBiMjVzYVc1bExtTnZiUzg0TkRVeE1UVmxOeTFoT1dOaUxUUmhaR010WWpaa015MHhOV0V4TVdRek5USTVOakl2ZGpJdU1Gd2lMRndpYVdGMFhDSTZNVFk0T1RVeU16TTVOQ3hjSW01aVpsd2lPakUyT0RrMU1qTXpPVFFzWENKbGVIQmNJam94TmpnNU5USTNNamswTEZ3aVlXbHZYQ0k2WENKQlYxRkJiUzg0VkVGQlFVRk1VVFIxWmxoT1pEUlRaazkzVVRKelZqbGhkak1yWlU1NlRYcEVjMmxDYjBkSFRYRlJhRkJrWVRabVV6TjVURWgxTjNkcVZ6RlpXRkF6T0drNWMzQnBjV1JpV2xaUGRWVkdhSFpEWWsxVk1rUnJkMUJ1VkRjelEyRkpZaTlIWjJwV1UxUTNkM056WlRsSGVIQlVVbEpLUkc0elF6ZFhOV01yT1VsWlkwOWxaRndpTEZ3aWJtRnRaVndpT2x3aVF1RzdtU0J0dzdSdUlFTk9VRTFjSWl4Y0ltOXBaRndpT2x3aU1UQmtOMlZtWkRNdFltWm1aaTAwWW1VMUxUa3lNVGd0TTJJellUUXpNVFkxWldJeFhDSXNYQ0p3Y21WbVpYSnlaV1JmZFhObGNtNWhiV1ZjSWpwY0luTjBaSE5sUUhadWRXRXVaV1IxTG5adVhDSXNYQ0p5YUZ3aU9sd2lNQzVCV0VsQk5YaFdVbWhOZFhBelJYRXlNSGhYYUVoVVZYQlpjMEpQZUU5SlVYWk5Ra1pxVG1KbWFrTTRWRU5XTjBSQlNVRXVYQ0lzWENKemRXSmNJanBjSW1GV1VrczJXVGxDVFZJeUxUUkpPR1l3ZFc1RkxVeHVSMlEzUzJsTE1VVXdOREUwZGs5UVh6VmxhRTFjSWl4Y0luUnBaRndpT2x3aU9EUTFNVEUxWlRjdFlUbGpZaTAwWVdSakxXSTJaRE10TVRWaE1URmtNelV5T1RZeVhDSXNYQ0oxZEdsY0lqcGNJa2xJYTBSUmNtRXhSMVZUTjBaZlJGRTJNbXhOUVVGY0lpeGNJblpsY2x3aU9sd2lNaTR3WENKOWZTSXNJblJ2WkdGNVJXMWhhV3hUWlc1MFEyOTFiblFpT2pBc0ltbGhkQ0k2TVRZNE9UVXlNemt5TXl3aVpYaHdJam94TmpnNU5USTNOVEl6ZlEuSlRLcWROeUoxem1GeVdIN2h6endocmxFTFc4eGlQZGRpTmR0MjF4SHZPQSIsIm1zQWNjb3VudEluZm8iOiJ7XCJob21lQWNjb3VudElkXCI6XCIxMGQ3ZWZkMy1iZmZmLTRiZTUtOTIxOC0zYjNhNDMxNjVlYjEuODQ1MTE1ZTctYTljYi00YWRjLWI2ZDMtMTVhMTFkMzUyOTYyXCIsXCJlbnZpcm9ubWVudFwiOlwibG9naW4ud2luZG93cy5uZXRcIixcInRlbmFudElkXCI6XCI4NDUxMTVlNy1hOWNiLTRhZGMtYjZkMy0xNWExMWQzNTI5NjJcIixcInVzZXJuYW1lXCI6XCJzdGRzZUB2bnVhLmVkdS52blwiLFwibG9jYWxBY2NvdW50SWRcIjpcIjEwZDdlZmQzLWJmZmYtNGJlNS05MjE4LTNiM2E0MzE2NWViMVwiLFwibmFtZVwiOlwiQuG7mSBtw7RuIENOUE1cIixcImlkVG9rZW5DbGFpbXNcIjp7XCJhdWRcIjpcImUyYzQ0ZWMwLWJjMTAtNDVjMC04Y2Q2LWRmOGMyZjEzMDk1ZVwiLFwiaXNzXCI6XCJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vODQ1MTE1ZTctYTljYi00YWRjLWI2ZDMtMTVhMTFkMzUyOTYyL3YyLjBcIixcImlhdFwiOjE2OTAwMDY0NjMsXCJuYmZcIjoxNjkwMDA2NDYzLFwiZXhwXCI6MTY5MDAxMDM2MyxcImFpb1wiOlwiQVdRQW0vOFRBQUFBUHgybEpjVFo2b2pvaWwraHRaVll2UW1wdjJESDJuZ1pIRmhmVGd6TTB4Y09hVTYrSnNLc1dzMG1pS2V2MC9reXpsdS83RS95L3l0MkwzOTBQL09MOHdxa3V6ZjVOT0Juc3JnNDdwU1RXZlRPdm5hdFBJcFB0OGVxalEyZ2NpdnRcIixcIm5hbWVcIjpcIkLhu5kgbcO0biBDTlBNXCIsXCJvaWRcIjpcIjEwZDdlZmQzLWJmZmYtNGJlNS05MjE4LTNiM2E0MzE2NWViMVwiLFwicHJlZmVycmVkX3VzZXJuYW1lXCI6XCJzdGRzZUB2bnVhLmVkdS52blwiLFwicmhcIjpcIjAuQVhJQTV4VlJoTXVwM0VxMjB4V2hIVFVwWXNCT3hPSVF2TUJGak5iZmpDOFRDVjdEQUlBLlwiLFwic3ViXCI6XCJhVlJLNlk5Qk1SMi00SThmMHVuRS1MbkdkN0tpSzFFMDQxNHZPUF81ZWhNXCIsXCJ0aWRcIjpcIjg0NTExNWU3LWE5Y2ItNGFkYy1iNmQzLTE1YTExZDM1Mjk2MlwiLFwidXRpXCI6XCJ5d0NXa2xZbkswV2VsVUlLa0QwOUFBXCIsXCJ2ZXJcIjpcIjIuMFwifX0iLCJ0b2RheUVtYWlsU2VudENvdW50IjowLCJjcmVhdGVkQXQiOiIyMDIzLTA3LTE0VDE1OjI0OjEyLjQxOVoiLCJ1cGRhdGVkQXQiOiIyMDIzLTA3LTIyVDA4OjQ4OjU4LjM0M1oiLCJpYXQiOjE2OTEyMjMzMjcsImV4cCI6MTY5MTIyNjkyN30.gNd8-JhLMGrhCws6Q4PX4RzBoUxaxxiOdvqt4dbcAq0"

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
                    console.log('tenant: ',tenantId)
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
                        console.log('token: ',response.data.accessToken)
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
                console.log('fail')
            }
        }
        Promise.all([
            microsoftTeams.initialize(),
            microsoftTeams.authentication.getAuthToken(authTokenRequest),
        ])
        // const tenantId = '845115e7-a9cb-4adc-b6d3-15a11d352962';
        // setLoading(true)
        // axios.post<object>(
        //     API_URL + "api/msteam/me/",
        //     {
        //         token,
        //         tenantId
        //     },
        //     {
        //         headers: {
        //             Accept: 'application/json',
        //         },
        //     },
        // ).then((response: any) => {
        //     setLoading(false);
        //     setUser(response.data.msTeamInfo)
        //     setAppToken(response.data.accessToken)
        //     console.log(response.data.accessToken)
        //     if (response.data.teacherId) {
        //         setTeacherCode(response.data.teacherId)
        //         setCurrentMode(mode.IS_AUTHENCATED)
        //         callApiGetSemester(response.data.accessToken)
        //     } else {
        //         setCurrentMode(mode.IS_REGISTER)
        //     }
        // }).catch((e) => {
        //     setLoading(false);
        //     setCurrentMode(mode.IS_REGISTER)
        //     Swal.fire({
        //         icon: 'error',
        //         text: 'Có lỗi xảy ra khi lấy thông tin người dùng',
        //         showConfirmButton: false,
        //         allowOutsideClick: false,
        //         allowEscapeKey: false
        //     })
        // });
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
                                                                <th></th>
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
                                                                        <td>
                                                                            <input type="checkbox"
                                                                                   onChange={(e)=>{
                                                                                       classes[index].hasMeetingEvent = e.target.value
                                                                                   }}
                                                                                   value={thisClass.hasMeetingEvent}/>
                                                                        </td>
                                                                        <td>{index + 1}</td>
                                                                        <td className="txt-center">
                                                                            <Input value={thisClass.displayName}
                                                                                   onChange={(e)=>{
                                                                                       classes[index].displayName = e.target.value
                                                                                   }}
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
