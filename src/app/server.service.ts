import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError, throwError as _throw} from 'rxjs';
import {ConstantsService} from './constants.service';
import {Select, Store} from '@ngxs/store';
import {IUser} from './core/interfaces/user';
import {IHeaderData} from '../interfaces/header-data';
import {IOverviewInfoResponse} from '../interfaces/Analytics2/overview-info';
import {
  ResetBotListAction,
  SaveVersionInfoInBot,
  SetAllBotListAction,
  UpdateBotInfoByIdInBotInBotList
} from './core/view-bots/ngxs/view-bot.action';
import {IBot, IBotResult, IBotVersionResult} from './core/interfaces/IBot';
import {Router} from '@angular/router';
import {
  ResetAppState,
  SetAutoLogoutTime,
  SetMasterIntegrationsList,
  SetMasterProfilePermissions,
  SetPipelineItemsV2,
  SetRoleInfo
} from './ngxs/app.action';
import {IIntegrationMasterListItem} from '../interfaces/integration-option';
import {ICustomNerItem} from '../interfaces/custom-ners';
import {ResetChatState, SetCurrentBotDetailsAndResetChatStateIfBotMismatch} from './chat/ngxs/chat.action';
import {IProfilePermission} from '../interfaces/profile-action-permission';
import {EHttpVerbs, PermissionService} from './permission.service';
import {EventService} from './event.service';
import {IPipelineItemV2} from './core/buildbot/build-code-based-bot/architecture/pipeline/pipeline.component';
import {IAppState} from './ngxs/app.state';
import {IRoleInfo} from '../interfaces/role-info';
import {LoggingService} from './logging.service';
import {MyToasterService} from './my-toaster.service';
import {environment} from '../environments/environment';
import {ENgxsStogareKey} from './typings/enum';


declare var $: any;
declare let deploy_obj_botplateform_fe;
import {Storage} from 'session-storage-sync';
import {identifierModuleUrl} from '@angular/compiler';
import {ResetAuthToDefaultState, ResetLoggedInStatus} from './auth/ngxs/auth.action';
import {ResetEnterpriseUsersAction} from './core/enterpriseprofile/ngxs/enterpriseprofile.action';
import {ResetBuildBotToDefault} from './core/buildbot/ngxs/buildbot.action';
import {ResetAnalytics2GraphData, ResetAnalytics2HeaderData} from './core/analysis2/ngxs/analysis.action';

@Injectable()
export class ServerService {
  static idTokenMap;
  static storage = new Storage();
  static AUTH_TOKEN: string = null;
  static USER_ACCESS_TOKEN: string = null;

  @Select() loggeduser$: Observable<{ user: IUser }>;
  @Select() app$: Observable<IAppState>;
  roleName: string;
  private isLoggedIn = false;
  roleInfo: IRoleInfo;


  static getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      return match[2];
    }
  }

  static getBotTokenById(id: number) {

    let bot_access_token = ServerService.idTokenMap && ServerService.idTokenMap[id];
    if (!bot_access_token) {
      const idTokenMap_SS = JSON.parse(sessionStorage.getItem(ENgxsStogareKey.idTokenMap));
      if (idTokenMap_SS) {
        ServerService.idTokenMap = idTokenMap_SS;
        bot_access_token = ServerService.idTokenMap && ServerService.idTokenMap[id];
      } else {
        throw new Error('Bot access token is not set in ServerService. Please see below');
        console.log('ServerService data: ', ServerService);
      }
    }
    return bot_access_token;
  }

  static setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT`;
    if (name === 'auth-token') {
      ServerService.AUTH_TOKEN = value;
    } else if (name === 'user-access-token') {
      ServerService.USER_ACCESS_TOKEN = value;
    }
  }

  static resetCookie() {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  static setSessionStorage(key, value: object) {

    ServerService.storage.session.set(key, value);
  }

  static isUserLoggedIn() {
    return ServerService.getCookie('auth-token');
  }

  constructor(
    private httpClient: HttpClient,
    private myToasterService: MyToasterService,
    private store: Store,
    private router: Router,
    private permissionService: PermissionService,
    private constantsService: ConstantsService) {

    EventService.logout$.subscribe((shouldCallLogoutApi?) => {
      this.logout(shouldCallLogoutApi);
    });

    ServerService.AUTH_TOKEN = ServerService.getCookie('auth-token');
    ServerService.USER_ACCESS_TOKEN = ServerService.getCookie('user-access-token');

    try {
      const idTokenMapStr = sessionStorage.getItem(ENgxsStogareKey.idTokenMap);
      ServerService.idTokenMap = JSON.parse(idTokenMapStr);
    } catch (e) {
      LoggingService.error(e);
    }

    this.loggeduser$.subscribe((value) => {

      if (!value || !value.user) {
        return;
      }
      // ServerService.AUTH_TOKEN = value.user.auth_token && value.user.auth_token;
      // ServerService.USER_ACCESS_TOKEN = value.user.user_access_token && value.user.user_access_token;
      this.roleName = value.user.role.name;
      this.app$.subscribe((appState) => {
        if (!this.roleInfo && appState && appState.roleInfoArr) {
          this.roleInfo = appState.roleInfoArr.find((role) => {
            return role.name === value.user.role.name;
          });
        }
      });
    });

    this.app$.subscribe((appState) => {/*todo: code repetition: this code should run after logged value has been set*/
      if (this.roleName) {
        if (appState.roleInfoArr) {
          this.roleInfo = appState.roleInfoArr.find((role) => {
            return role.name === this.roleName;
          });
        }
      }
    });


  }

  removeTokens() {
    ServerService.USER_ACCESS_TOKEN = null;
    ServerService.AUTH_TOKEN = null;
  }

  createHeaders(headerData?: any): HttpHeaders {
    let headers = new HttpHeaders();
    let tokenData: IHeaderData = {};
    tokenData = {'user-access-token': ServerService.USER_ACCESS_TOKEN};
    tokenData = {...tokenData, 'auth-token': ServerService.AUTH_TOKEN};
    tokenData = {...tokenData, 'content-type': 'application/json'};

    headerData = {
      ...tokenData,
      ...headerData,
    };

    if (headerData) {
      for (const key in headerData) {
        /*don't set header data for undefined values*/
        if (headerData[key]) {
          (headers = headers.set(key, headerData[key]));
        }
      }
    }
    return headers;
  }

  showErrorMessageForErrorTrue({error, message, action}) {

    /*check for logout*/
    if (action === 'logout') {
      EventService.logout$.emit(false);
      return;
    }

    if (message) {
      this.myToasterService.showErrorToaster(message);
    } else {
      console.error('error toaster called without error');
    }
  }

  makeGetReq<T>(reqObj: { url: string, headerData?: any, noValidateUser?: boolean }): Observable<any> {

    const isApiAccessDenied = this.permissionService.isApiAccessDenied(reqObj.url, EHttpVerbs.GET);
    if (!reqObj.noValidateUser && isApiAccessDenied) {
      console.log(`api access not allowed:${reqObj.url}`);
      // return throwError(`api access not allowed:${reqObj.url}`);
      return of(null);
    }
    const headers = this.createHeaders(reqObj.headerData);


    this.changeProgressBar(true, 0);
    return this.httpClient.get<T>(reqObj.url, {headers: headers}).pipe(
      map((value: any) => {
        if (value && value.error) {
          this.showErrorMessageForErrorTrue(value);
          return throwError(value);
        } else {
          return value;
        }
      }),
      tap((value) => {
        this.changeProgressBar(false, 100);
        this.increaseAutoLogoutTime();
        this.checkForLogoutAction(value);
      }),
      catchError((e: any, caught: Observable<T>) => {
        debugger;
        // if (e.status === 401) {
        //   this.checkForLogoutAction({action: 'logout'});
        // }
        // this.checkForLogoutAction(value);
        return this.handleErrorFromServer(e);
      }));
  }

  handleErrorFromServer(e) {

    if (e.error && (e.error.error === true)) {
      this.showErrorMessageForErrorTrue(e.error);
    } else {
      this.showErrorMessageForErrorTrue({error: true, message: 'Some error occurred', action: null});
    }
    // let arg = (e.error && e.error.error) ? e.error : e;
    // this.showErrorMessageForErrorTrue(arg);
    this.changeProgressBar(false, 100);
    if (isDevMode()) {
      LoggingService.error(e);
      // this.utilityService.showErrorToaster(e);
    }
    return _throw(e);
  }

  makeGetReqToDownloadFiles(reqObj: { url: string, headerData?: any, noValidateUser?: boolean }) {
    this.checkApiAccess(reqObj, EHttpVerbs.GET);
    const headers = this.createHeaders(reqObj.headerData);

    this.changeProgressBar(true, 0);
    return this.httpClient.get(reqObj.url, {headers: headers, responseType: 'text'}).pipe(
      map((value: any) => {
        return this.checkForErrorTrue(value);
      }),
      tap((value) => {
        this.changeProgressBar(false, 100);
        this.increaseAutoLogoutTime();
        this.checkForLogoutAction(value);
      }),
      catchError((e: any) => {
        return this.handleErrorFromServer(e);
      }));
  }

  checkApiAccess(reqObj, verb: EHttpVerbs) {
    const isApiAccessDenied = this.permissionService.isApiAccessDenied(reqObj.url, verb);
    if (!reqObj.noValidateUser && isApiAccessDenied) {
      console.log(`api access not allowed:${reqObj.url}`);
      return throwError(`api access not allowed:${reqObj.url}`);
    }
  }

  getNSetRoleInfo() {
    const getRoleUrl = this.constantsService.getRoleUrl();
    return this.makeGetReq({url: getRoleUrl})
      .pipe(switchMap((val) => {
        if (val) {
          return this.store.dispatch([
            new SetRoleInfo({roleInfoArr: val.objects})
          ]);
        } else {
          return of(1);
        }
      }));
  }

  makeDeleteReq<T>(reqObj: { url: string, headerData?: any, noValidateUser?: boolean }) {
    this.checkApiAccess(reqObj, EHttpVerbs.DELETE);
    const headers = this.createHeaders(reqObj.headerData);
    this.changeProgressBar(true, 0);
    return this.httpClient.delete<T>(reqObj.url, {headers: headers}).pipe(
      map((value: any) => {
        return this.checkForErrorTrue(value);
      }),
      tap((value) => {
        this.changeProgressBar(false, 100);
        this.increaseAutoLogoutTime();
        this.checkForLogoutAction(value);
      }),
      catchError((e: any, caught: Observable<T>) => {
        // if (e.status === 401) {
        //   this.checkForLogoutAction({action: 'logout'});
        // }
        return this.handleErrorFromServer(e);
      }));
  }

  makePostReq<T>(reqObj: { url: string, body: any, headerData?: any, dontShowProgressBar?: boolean, noValidateUser?: boolean }) {
    let headers: HttpHeaders;
    this.checkApiAccess(reqObj, EHttpVerbs.POST);
    headers = this.createHeaders(reqObj.headerData);
    if (!reqObj.dontShowProgressBar) {
      this.changeProgressBar(true, 0);
    }
    return this.httpClient.post<T>(reqObj.url, reqObj.body, {headers: headers}).pipe(
      map((value: any) => {
        return this.checkForErrorTrue(value);
      }),
      tap((value) => {
        this.checkForLogoutAction(value);
        this.increaseAutoLogoutTime();
        if (!reqObj.dontShowProgressBar) {
          this.changeProgressBar(false, 100);
        }
        this.checkForLogoutAction(value);
      }),
      catchError((e: any, caught: Observable<T>) => {
        // if (e.status === 401) {
        //   this.checkForLogoutAction({action: 'logout'});
        // }
        return this.handleErrorFromServer(e);
      }));
  }

  makePutReq<T>(reqObj: { url: string, body: any, headerData?: IHeaderData }) {

    this.checkApiAccess(reqObj, EHttpVerbs.PUT);
    const headers = this.createHeaders(reqObj.headerData);
    this.changeProgressBar(true, 0);

    return this.httpClient.put<T>(reqObj.url, JSON.stringify(reqObj.body), {headers: headers}).pipe(
      map((value: any) => {

        return this.checkForErrorTrue(value);
      }),
      tap((value) => {
        this.increaseAutoLogoutTime();
        this.changeProgressBar(false, 100);
        this.checkForLogoutAction(value);
      }),
      catchError((e: any, caught: Observable<T>) => {
        // if (e.status === 401) {
        //   this.checkForLogoutAction({action: 'logout'});
        // }
        return this.handleErrorFromServer(e);
      }));
  }

  checkForLogoutAction(obj: { action: string }) {
    if (!obj) {
      return;
    }
    const {action} = obj;
    if (action === 'logout') {
      /* temporary*/
      localStorage.clear();
      EventService.logout$.emit();
      // location.reload();
      return;
    }
  }

  logout(shouldCallLogoutApi = true) {
    debugger;

    localStorage.setItem(ENgxsStogareKey.IMI_BOT_STORAGE_KEY, null);
    ServerService.resetCookie();
    sessionStorage.clear();
    const url = this.constantsService.getLogoutUrl();
    this.store.dispatch([
      new ResetBotListAction(),
      new ResetLoggedInStatus(),
      new ResetEnterpriseUsersAction(),
      new ResetBuildBotToDefault(),
      new ResetAnalytics2GraphData(),
      new ResetAnalytics2HeaderData(),
      new ResetAppState()
    ]).subscribe(() => {
      this.store.dispatch([new ResetChatState()])
        .subscribe(() => {
          if (!environment.mock && shouldCallLogoutApi) {
            this.router.navigate(['auth', 'login'])
              .then(() => {
                this.store.dispatch([
                    new ResetAuthToDefaultState()/*can't reset auth state to default as its being used on this page*/
                  ]
                );
              });
            this.makeGetReq({url})
              .subscribe((v) => {
                this.myToasterService.showSuccessToaster('Logged Out');
              }, () => {
                // this.router.navigate(['auth', 'login']);
              });
            // this.bc.postMessage('This is a test message.');
          } else {
            this.router.navigate(['auth', 'login'])
              .then(() => {
                this.store.dispatch([
                    new ResetAuthToDefaultState()/*can't reset auth state to default as its being used on this page*/
                  ]
                );

              });
          }
        });
    });
    this.removeTokens();

  }


  checkForErrorTrue(value) {
    if (value && value.error === true) {
      throw new Error(value.message);
    } else {
      return value;
    }
  }

  fetchSpecificBotFromServerAndUpdateBotList(bot: IBot) {
    const getBotByTokenUrl = this.constantsService.getSpecificBotByBotTokenUrl();
    const headerData: IHeaderData = {
      'bot-access-token': ServerService.getBotTokenById(bot.id)
    };
    return this.makeGetReq<{ objects: IBot[] }>({url: getBotByTokenUrl, headerData}).pipe(
      map((val) => {

        const updated_bot: IBot = val.objects.find((bot_item) => {

          return true; // bot_item.id === bot_item.id;/*todo: what the heck is going on here*/
        });
        return this.store.dispatch([
          new UpdateBotInfoByIdInBotInBotList({data: updated_bot, botId: updated_bot.id})
        ]);
      }));
  }

  getOverviewInfo<T>(body: any): Observable<IOverviewInfoResponse> {
    const url = this.constantsService.getOverViewInfoUrl();
    return this.makePostReq<IOverviewInfoResponse>({url, body});
  }

  increaseAutoLogoutTime() {
    let autoLogoutInterval = Infinity;
    if (this.roleInfo) {

      if (this.roleInfo.session_expiry_time === -1) {
        autoLogoutInterval = Infinity;
      } else {
        autoLogoutInterval = (this.roleInfo && this.roleInfo.session_expiry_time * 1000) || 3600 * 1000; // 3600*1000
      }
    }
    if (!this.roleInfo) {
      // console.log("increaseAutoLogoutTime: ROLE IS NOT FOUND=====================")
    }
    this.store.dispatch([
      new SetAutoLogoutTime({time: (Date.now() + autoLogoutInterval)})
    ]);
  }

  getNSetBotList(noValidateUser?, is_dashboard?) {

    const url = this.constantsService.getBotListUrl(is_dashboard);
    const headerData: IHeaderData = {'content-type': 'application/json'};

    return this.makeGetReq<IBotResult>({url, headerData, noValidateUser}).pipe(
      tap((botResult: { objects: IBot[] }) => {
        // let botList: IBot[] = [];
        // let pipelineBasedBotList: IBot[] = [];

        // botResult.objects.forEach((bot) => {
        //   bot.bot_type !== 'genbot' ? botList.push(bot) : pipelineBasedBotList.push(bot);
        // });
        if (botResult) {

          const idTokenMap = botResult.objects.reduce((total, bot) => {
            return {
              ...total,
              [bot.id]: (bot.bot_access_token)
            };
          }, {});
          // sessionStorage.setItem(ENgxsStogareKey.idTokenMap, JSON.stringify(idTokenMap));
          ServerService.setSessionStorage(ENgxsStogareKey.idTokenMap, idTokenMap);
          ServerService.idTokenMap = idTokenMap;
          this.store.dispatch(new SetAllBotListAction({botList: botResult.objects}));
        }
      }));

  }

  getNSetChatPreviewBot(bot_unique_name: string, enterprise_unique_name: string) {

    const url = this.constantsService.getNSetChatPreviewBotUrl(bot_unique_name, enterprise_unique_name);
    return this.makeGetReq({url, noValidateUser: true})
      .pipe(map((bot: IBot) => {
        ServerService.idTokenMap = {
          ...(ServerService.idTokenMap || {}),
          [bot.id]: bot.bot_access_token
        };

        return this.store.dispatch([
          new SetCurrentBotDetailsAndResetChatStateIfBotMismatch({bot}),
        ]);
      }));
  }


  getNSetPipelineModuleV2() {

    const url = this.constantsService.getPipelineModuleV2();
    return this.makeGetReq<{ meta: any, objects: IPipelineItemV2[] }>({url})
      .pipe(switchMap((value) => {
        if (value) {
          return this.store.dispatch([
            new SetPipelineItemsV2({
              data: value.objects
            })
          ]);
        } else {
          return of(1);
        }
      }));
  }

  getNSetIntegrationList() {
    const url = this.constantsService.getMasterIntegrationsList();
    return this.makeGetReq<{ meta: any, objects: IIntegrationMasterListItem[] }>({url}).pipe(
      tap((value) => {
        // this.store.dispatch(new SetPipeLineBasedBotListAction({botList: pipelineBasedBotList}));
        // this.store.dispatch(new SetCodeBasedBotListAction({botList: botList}));
      }))
      .pipe(switchMap((value) => {
        if (value) {
          return this.store.dispatch([
            new SetMasterIntegrationsList({
              masterIntegrationList: value.objects
            })
          ]);
        } else {
          return of(1);
        }
      }));
  }

  changeProgressBar(loading: boolean, value: number) {
    // this.store.dispatch([
    //   new SetProgressValue({
    //     progressbar: {
    //       loading: loading,
    //       value: value
    //     }
    //   }
    //   )
    // ]);
    // this.
    EventService.progressBar$.emit({loading: loading, value: value});

  }

  updateOrSaveCustomNer(selectedOrNewRowData: ICustomNerItem, bot?: IBot) {
    let body: ICustomNerItem;
    const headerData: IHeaderData = {'bot-access-token': bot && ServerService.getBotTokenById(bot.id)};
    let url, methodStr;
    if (selectedOrNewRowData && selectedOrNewRowData.id) {/*update customner*/
      url = this.constantsService.updateOrDeleteCustomBotNER(selectedOrNewRowData.id);
      methodStr = 'makePutReq';
      body = {
        values: selectedOrNewRowData.values,
        column_headers: selectedOrNewRowData.column_headers,
        ...selectedOrNewRowData
      };
    } else {/*create a new customner*/
      url = this.constantsService.createNewCustomBotNER();
      methodStr = 'makePostReq';
      body = selectedOrNewRowData;
    }
    return this[methodStr]({url, body, headerData});
  }

  deleteNer(ner_id: number, bot?: IBot) {
    let url, headerData: IHeaderData;
    if (bot) {
      url = this.constantsService.updateOrDeleteCustomBotNER(ner_id);
      headerData = {
        'bot-access-token': (ServerService.getBotTokenById(bot.id)) || null
      };
    } else {
      url = this.constantsService.updateOrDeleteEnterpriseNer(ner_id);
    }
    return this.makeDeleteReq({url, headerData});
  }

  getAllVersionOfBotFromServerAndStoreInBotInBotList(botId, bot_access_token) {

    const url = this.constantsService.getAllVersionsByBotId();
    // let botId = this.bot.roomId;
    this.makeGetReq<IBotVersionResult>({url, headerData: {'bot-access-token': bot_access_token}})
      .subscribe((botVersionResult) => {
        botVersionResult.objects.forEach((version) => {
          version.changed_fields = {
            'df_template': false,
            'df_rules': false,
            'generation_rules': false,
            'generation_template': false,
            'workflows': false
          };
          version.validation = {
            'df_template': {error: false},
            'df_rules': {error: false},
            'generation_rules': {error: false},
            'generation_templates': {error: false},
            'workflow': {error: false},
          };
        });

        this.store.dispatch([
          new SaveVersionInfoInBot({data: botVersionResult.objects, botId: botId})
        ]);
      });
  }

  getNSetConfigData$() {
  }


  updateBot(bot: IBot) {
    const url = this.constantsService.updateBotUrl(bot.id);
    const headerData: IHeaderData = {
      'bot-access-token': ServerService.getBotTokenById(bot.id)
    };

    return this.makePutReq({url, body: bot, headerData})
      .pipe(tap((updatedBot: IBot) => {
          EventService.botUpdatedInServer$.emit(updatedBot);
          this.store.dispatch([
            new UpdateBotInfoByIdInBotInBotList({botId: bot.id, data: updatedBot})
          ]);
          this.myToasterService.showSuccessToaster('Bot updated');
        },
        err => {
          EventService.codeValidationErrorOnUpdate$.emit(err.error);
          console.log('emited this :::::::::::::', err.error);
        }));
  }


  getNSetMasterPermissionsList() {

    const allActionsUrl = this.constantsService.getAllActionsUrl();
    return this.makeGetReq<{ meta: any, objects: IProfilePermission[] }>({url: allActionsUrl})
      .pipe(
        switchMap((value: { objects: IProfilePermission[] }) => {
          return this.store.dispatch([
            new SetMasterProfilePermissions({masterProfilePermissions: value.objects})
          ]);
        }));
  }

  getLinkMetaData(link) {
    return this.makeGetReq({url: 'http://api.linkpreview.net/?key=5c488da19fef97c0cb6a5fbc472a08d3def1842ea6ac3&q=' + link});
  }


  compareDeployDates() {
    if (!deploy_obj_botplateform_fe || isDevMode() || environment.production) {
      return;
    }
    const lastDeployed_Cache = deploy_obj_botplateform_fe.lastDeploy;
    this.makeGetReq({url: `/static/deploy.json?time=${Date.now()}`})
      .subscribe((value: { 'currentBranch': string, 'lastDeploy': number }) => {
        const lastDeployed_api = value.lastDeploy;
        console.log(`compareDeployDates::lastDeployed_api=${lastDeployed_api}, lastDeployed_api=${lastDeployed_api}`);
        const days = this.timeDifference(lastDeployed_api, lastDeployed_Cache);
        if (lastDeployed_api > lastDeployed_Cache) {
          this.myToasterService.showErrorToaster(`your version is ${days} old.
        Please hard reload (Ctrl + shit + r). `);
        }
      });
  }

  timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
      return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
      return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
      return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
    }
  }


}
