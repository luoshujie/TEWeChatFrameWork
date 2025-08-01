// @ts-nocheck
const unityNamespace = {
    canvas: GameGlobal.canvas,
    // cache width
    canvas_width: GameGlobal.canvas.width,
    // cache height
    canvas_height: GameGlobal.canvas.height,
    navigator: GameGlobal.navigator,
    XMLHttpRequest: GameGlobal.XMLHttpRequest,
    // 是否显示耗时的弹框，默认开发版时显示弹出耗时弹框
    hideTimeLogModal: true,
    // 是否打印详细日志
    enableDebugLog: false,
    // 自定义bundle中的hash长度
    bundleHashLength: 32,
    // 单位Bytes, 1MB = 1024 KB = 1024*1024Bytes
    releaseMemorySize: 31457280,
    unityVersion: '2021.3.30f1c1',
    // Color Space: Gamma、Linear、Uninitialized(未初始化的颜色空间)
    unityColorSpace: 'Gamma',
    convertPluginVersion: '202505120809',
    // 拼在StreamingAssets前面的path，DATA_CDN + streamingUrlPrefixPath + StreamingAssets
    streamingUrlPrefixPath: '',
    // DATA_CDN + dataFileSubPrefix + datafilename
    dataFileSubPrefix: '',
    // 当前appid扩容后，通过本字段告知插件本地存储最大容量，单位MB
    maxStorage: 200,
    // 纹理中的hash长度
    texturesHashLength: 8,
    // 纹理存放路径
    texturesPath: 'Assets/Textures',
    // 是否需要缓存纹理,
    needCacheTextures: true,
    // AssetBundle在内存中的存活时间
    ttlAssetBundle: 5,
    // 是否显示性能面板
    enableProfileStats: false,
    // 是否预载微信系统字体
    preloadWXFont: false,
    // iOS高性能模式定期GC间隔
    iOSAutoGCInterval: 10000,
    // 是否使用微信压缩纹理
    usedTextureCompression: GameGlobal.USED_TEXTURE_COMPRESSION,
    // 是否使用autostreaming
    usedAutoStreaming: false,
    // 是否显示渲染日志(dev only)
    enableRenderAnalysisLog: false,
    // 是否dotnet runtime
    useDotnetRuntime: false,
    // 是否用了多线程brotli压缩
    useBrotliMT: true,
    // Boot config配置，包含例如wait-for-native-debugger、player-connection-ip等信息
    bootConfig: 'player-connection-ip=192.168.31.251',
    // 是否以Development Build构建
    isDevelopmentBuild: false,
    // 是否以Profiling Build导出
    isProfilingBuild: false,
    // 预留的堆内存
    unityHeapReservedMemory: 256,
};
// 最佳实践检测配置
unityNamespace.monitorConfig = {
    // 显示优化建议弹框
    showSuggestModal: true,
    // 是否开启检测（只影响开发版/体验版，线上版本不会检测）
    enableMonitor: true,
    // 帧率低于此值的帧会被记录，用于分析长耗时帧，做了限帧的游戏应该适当调低
    fps: 10,
    // 是否一直检测到游戏可交互完成
    showResultAfterLaunch: true,
    // 仅当showResultAfterLaunch=false时有效, 在引擎初始化完成(即callmain)后多长时间停止检测
    monitorDuration: 30000,
};
// 判断是否需要自动缓存的文件，返回true自动缓存；false不自动缓存
unityNamespace.isCacheableFile = function (path) {
    // 判定为下载bundle的路径标识符，此路径下的下载，会自动缓存
    const cacheableFileIdentifier = ["StreamingAssets"];
    // 命中路径标识符的情况下，并不是所有文件都有必要缓存，过滤下不需要缓存的文件
    const excludeFileIdentifier = ["json"];
    if (cacheableFileIdentifier.some(identifier => path.includes(identifier)
        && excludeFileIdentifier.every(excludeIdentifier => !path.includes(excludeIdentifier)))) {
        return true;
    }
    return false;
};
// 是否上报此条网络异常, 返回true则上报, 返回false则忽略
unityNamespace.isReportableHttpError = function (_info) {
    // const { url, error } = _info;
    return true;
};
// 判断是否是AssetBundle
unityNamespace.isWXAssetBundle = function (path) {
    return unityNamespace.WXAssetBundles.has(unityNamespace.PathInFileOS(path));
};
unityNamespace.PathInFileOS = function (path) {
    return path.replace(`${wx.env.USER_DATA_PATH}/__GAME_FILE_CACHE`, '');
};
unityNamespace.WXAssetBundles = new Map();
// 清理缓存时是否可被自动清理；返回true可自动清理；返回false不可自动清理
unityNamespace.isErasableFile = function (info) {
    // 用于特定AssetBundle的缓存保持
    if (unityNamespace.WXAssetBundles.has(info.path)) {
        return false;
    }
    // 达到缓存上限时，不会被自动清理的文件
    const inErasableIdentifier = [];
    if (inErasableIdentifier.some(identifier => info.path.includes(identifier))) {
        return false;
    }
    return true;
};
GameGlobal.WebAssembly = GameGlobal.WXWebAssembly;
GameGlobal.unityNamespace = GameGlobal.unityNamespace || unityNamespace;
GameGlobal.realtimeLogManager = wx.getRealtimeLogManager();
GameGlobal.logmanager = wx.getLogManager({ level: 0 });
GameGlobal.disableMultiTouch = false;
// 提前监听错误并打日志
function bindGloblException() {
    // 默认上报小游戏实时日志与用户反馈日志(所有error日志+小程序框架异常)
    wx.onError((result) => {
        // 若manager已初始化，则直接用manager打日志即可
        if (GameGlobal.manager) {
            GameGlobal.manager.printErr(result.message);
        }
        else {
            GameGlobal.realtimeLogManager.error(result);
            const isErrorObj = result && result.stack;
            GameGlobal.logmanager.warn(isErrorObj ? result.stack : result);
            console.error('onError:', result);
        }
    });
    wx.onUnhandledRejection((result) => {
        GameGlobal.realtimeLogManager.error(result);
        const isErrorObj = result && result.reason && result.reason.stack;
        GameGlobal.logmanager.warn(isErrorObj ? result.reason.stack : result.reason);
        console.error('unhandledRejection:', result.reason);
    });
    // 上报初始信息
    function printSystemInfo(appBaseInfo, deviceInfo) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { version, SDKVersion } = appBaseInfo;
        const { platform, system } = deviceInfo;
        unityNamespace.version = version;
        unityNamespace.SDKVersion = SDKVersion;
        unityNamespace.platform = platform;
        unityNamespace.system = system;
        unityNamespace.isPc = platform === 'windows' || platform === 'mac';
        unityNamespace.isDevtools = platform === 'devtools';
        unityNamespace.isMobile = !unityNamespace.isPc && !unityNamespace.isDevtools;
        unityNamespace.isH5Renderer = GameGlobal.isIOSHighPerformanceMode;
        unityNamespace.isIOS = platform === 'ios';
        unityNamespace.isAndroid = platform === 'android';
        const bootinfo = {
            renderer: GameGlobal.isIOSHighPerformanceMode ? 'h5' : '',
            isH5Plus: GameGlobal.isIOSHighPerformanceModePlus || false,
            abi: deviceInfo.abi || '',
            brand: deviceInfo.brand,
            model: deviceInfo.model,
            platform: deviceInfo.platform,
            system: deviceInfo.system,
            version: appBaseInfo.version,
            SDKVersion: appBaseInfo.SDKVersion,
            benchmarkLevel: deviceInfo.benchmarkLevel,
        };
        GameGlobal.realtimeLogManager.info('game starting', bootinfo);
        GameGlobal.logmanager.info('game starting', bootinfo);
        console.info('game starting', bootinfo);
    }
    const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : wx.getSystemInfoSync();
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : wx.getSystemInfoSync();
    printSystemInfo(appBaseInfo, deviceInfo);
}
bindGloblException();
// eslint-disable-next-line no-multi-assign
GameGlobal.onCrash = GameGlobal.unityNamespace.onCrash = function () {
    GameGlobal.manager.showAbort();
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    wx.createFeedbackButton({
        type: 'text',
        text: '提交反馈',
        style: {
            left: (windowInfo.screenWidth - 184) / 2,
            top: windowInfo.screenHeight / 3 + 140,
            width: 184,
            height: 40,
            lineHeight: 40,
            backgroundColor: '#07C160',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: 16,
            borderRadius: 4,
        },
    });
};
export default GameGlobal.unityNamespace;
