
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@nutrion_language';

// Complete translation resources for all languages
const resources = {
  en: {
    translation: {
      // Common
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      ok: 'OK',
      next: 'Next',
      
      // Tabs
      pantry: 'Pantry',
      planner: 'Planner',
      shopping: 'Shopping',
      profile: 'Profile',
      
      // Auth
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.signOut': 'Sign Out',
      'auth.notLoggedIn': 'Not Logged In',
      'auth.email': 'Email',
      'auth.password': 'Password',
      
      // Pantry
      'pantry.title': 'My Pantry',
      'pantry.addFirst': 'Add your first item',
      'pantry.search': 'Search pantry...',
      'pantry.addItem': 'Add Item',
      'pantry.scanBarcode': 'Scan Barcode',
      'pantry.foodSearch': 'Food Search',
      'pantry.itemName': 'Item Name',
      'pantry.category': 'Category',
      'pantry.quantity': 'Quantity',
      'pantry.unit': 'Unit',
      'pantry.expirationDate': 'Expiration Date',
      'pantry.notes': 'Notes',
      'pantry.addToPantry': 'Add to Pantry',
      'pantry.itemAdded': 'Item added to pantry!',
      'pantry.itemDeleted': 'Item deleted',
      'pantry.deleteConfirm': 'Are you sure you want to delete this item?',
      'pantry.expiresIn': 'Expires in {{days}} days',
      'pantry.expired': 'Expired',
      'pantry.fresh': 'Fresh',
      'pantry.emptyTitle': 'Your pantry is empty',
      'pantry.emptyDescription': 'Start by adding items to track your food inventory',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Scan Barcode',
      cameraPermission: 'Camera Permission Required',
      cameraPermissionText: 'We need access to your camera to scan barcodes',
      grantPermission: 'Grant Permission',
      positionBarcode: 'Position the barcode within the frame',
      lookingUp: 'Looking up product...',
      scanAgain: 'Tap to Scan Again',
      productFound: 'Product Found!',
      productNotFound: 'Product Not Found',
      productNotFoundText: 'This barcode was not found in the database. Please add the item manually.',
      addManually: 'Add Manually',
      tryAgain: 'Try Again',
      addToPantry: 'Add to Pantry',
      
      // Planner
      'planner.title': 'Meal Planner',
      'planner.myRecipes': 'My Recipes',
      'planner.aiSuggestions': 'AI Suggestions',
      'planner.getAiSuggestions': 'Get AI Recipe Suggestions',
      'planner.basedOnPantry': 'Based on your pantry items',
      'planner.noRecipes': 'No recipes yet',
      'planner.addRecipeHint': 'Add recipes to start planning meals',
      'planner.ingredientsAvailable': '{{count}} ingredients available',
      
      // Shopping
      'shopping.title': 'Shopping List',
      'shopping.addNewItem': 'Add New Item',
      'shopping.itemsCompleted': '{{count}} items completed',
      'shopping.clearCompleted': 'Clear Completed',
      'shopping.noShoppingItems': 'Your shopping list is empty',
      'shopping.addItemsHint': 'Add items you need to buy',
      
      // Profile
      'profile.title': 'Profile',
      'profile.statistics': 'Statistics',
      'profile.totalItems': 'Total Items',
      'profile.expiringSoon': 'Expiring Soon',
      'profile.expired': 'Expired',
      'profile.security': 'Security',
      'profile.settings': 'Settings',
      'profile.language': 'Language',
      'profile.languageDesc': 'Change app language',
      'profile.notifications': 'Notifications',
      'profile.notificationsDesc': 'Manage notification preferences',
      'profile.about': 'About',
      'profile.aboutDesc': 'App information and support',
      'profile.tutorial': 'Tutorial',
      'profile.tutorialDesc': 'View app tutorial again',
      'profile.signOut': 'Sign Out',
      'profile.signOutConfirm': 'Are you sure you want to sign out?',
      'profile.signedOut': 'Signed out successfully',
      'profile.signOutError': 'Failed to sign out',
      'profile.pleaseSignIn': 'Please sign in to use this feature',
      'profile.biometricEnabled': 'Biometric authentication enabled',
      'profile.biometricDisabled': 'Biometric authentication disabled',
      'profile.biometricAuthFailed': 'Biometric authentication failed',
      'profile.biometricEnableError': 'Failed to enable biometric authentication',
      'profile.biometricDisableError': 'Failed to disable biometric authentication',
      'profile.biometricDesc': 'Use biometric authentication to sign in',
      'profile.disableBiometric': 'Disable Biometric',
      'profile.disableBiometricConfirm': 'Are you sure you want to disable biometric authentication?',
      'profile.disable': 'Disable',
      'profile.twoFactor': 'Two-Factor Authentication',
      'profile.twoFactorDesc': 'Add an extra layer of security',
      'profile.twoFactorEnabled': 'Enabled',
      'profile.twoFaDisabled': 'Two-factor authentication disabled',
      'profile.twoFaDisableError': 'Failed to disable two-factor authentication',
      'profile.disableTwoFa': 'Disable 2FA',
      'profile.disableTwoFaConfirm': 'Are you sure you want to disable two-factor authentication?',
      
      // Categories
      dairy: 'Dairy',
      meat: 'Meat',
      fruits: 'Fruits',
      vegetables: 'Vegetables',
      grains: 'Grains',
      beverages: 'Beverages',
      snacks: 'Snacks',
      condiments: 'Condiments',
      frozen: 'Frozen',
      other: 'Other',
      
      // Units
      pcs: 'pcs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'cup',
      tbsp: 'tbsp',
      tsp: 'tsp',
    },
  },
  es: {
    translation: {
      // Common
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      ok: 'OK',
      next: 'Siguiente',
      
      // Tabs
      pantry: 'Despensa',
      planner: 'Planificador',
      shopping: 'Compras',
      profile: 'Perfil',
      
      // Auth
      'auth.signIn': 'Iniciar sesión',
      'auth.signUp': 'Registrarse',
      'auth.signOut': 'Cerrar sesión',
      'auth.notLoggedIn': 'No has iniciado sesión',
      'auth.email': 'Correo electrónico',
      'auth.password': 'Contraseña',
      
      // Pantry
      'pantry.title': 'Mi Despensa',
      'pantry.addFirst': 'Agrega tu primer artículo',
      'pantry.search': 'Buscar en despensa...',
      'pantry.addItem': 'Agregar artículo',
      'pantry.scanBarcode': 'Escanear código de barras',
      'pantry.foodSearch': 'Buscar alimentos',
      'pantry.itemName': 'Nombre del artículo',
      'pantry.category': 'Categoría',
      'pantry.quantity': 'Cantidad',
      'pantry.unit': 'Unidad',
      'pantry.expirationDate': 'Fecha de vencimiento',
      'pantry.notes': 'Notas',
      'pantry.addToPantry': 'Agregar a la despensa',
      'pantry.itemAdded': '¡Artículo agregado a la despensa!',
      'pantry.itemDeleted': 'Artículo eliminado',
      'pantry.deleteConfirm': '¿Estás seguro de que quieres eliminar este artículo?',
      'pantry.expiresIn': 'Vence en {{days}} días',
      'pantry.expired': 'Vencido',
      'pantry.fresh': 'Fresco',
      'pantry.emptyTitle': 'Tu despensa está vacía',
      'pantry.emptyDescription': 'Comienza agregando artículos para rastrear tu inventario de alimentos',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Escanear código de barras',
      cameraPermission: 'Permiso de cámara requerido',
      cameraPermissionText: 'Necesitamos acceso a tu cámara para escanear códigos de barras',
      grantPermission: 'Conceder permiso',
      positionBarcode: 'Posiciona el código de barras dentro del marco',
      lookingUp: 'Buscando producto...',
      scanAgain: 'Toca para escanear de nuevo',
      productFound: '¡Producto encontrado!',
      productNotFound: 'Producto no encontrado',
      productNotFoundText: 'Este código de barras no se encontró en la base de datos. Por favor agrega el artículo manualmente.',
      addManually: 'Agregar manualmente',
      tryAgain: 'Intentar de nuevo',
      addToPantry: 'Agregar a la despensa',
      
      // Planner
      'planner.title': 'Planificador de comidas',
      'planner.myRecipes': 'Mis recetas',
      'planner.aiSuggestions': 'Sugerencias de IA',
      'planner.getAiSuggestions': 'Obtener sugerencias de recetas con IA',
      'planner.basedOnPantry': 'Basado en los artículos de tu despensa',
      'planner.noRecipes': 'Aún no hay recetas',
      'planner.addRecipeHint': 'Agrega recetas para comenzar a planificar comidas',
      'planner.ingredientsAvailable': '{{count}} ingredientes disponibles',
      
      // Shopping
      'shopping.title': 'Lista de compras',
      'shopping.addNewItem': 'Agregar nuevo artículo',
      'shopping.itemsCompleted': '{{count}} artículos completados',
      'shopping.clearCompleted': 'Limpiar completados',
      'shopping.noShoppingItems': 'Tu lista de compras está vacía',
      'shopping.addItemsHint': 'Agrega artículos que necesites comprar',
      
      // Profile
      'profile.title': 'Perfil',
      'profile.statistics': 'Estadísticas',
      'profile.totalItems': 'Artículos totales',
      'profile.expiringSoon': 'Próximos a vencer',
      'profile.expired': 'Vencidos',
      'profile.security': 'Seguridad',
      'profile.settings': 'Configuración',
      'profile.language': 'Idioma',
      'profile.languageDesc': 'Cambiar idioma de la aplicación',
      'profile.notifications': 'Notificaciones',
      'profile.notificationsDesc': 'Gestionar preferencias de notificaciones',
      'profile.about': 'Acerca de',
      'profile.aboutDesc': 'Información de la aplicación y soporte',
      'profile.tutorial': 'Tutorial',
      'profile.tutorialDesc': 'Ver el tutorial de la aplicación nuevamente',
      'profile.signOut': 'Cerrar sesión',
      'profile.signOutConfirm': '¿Estás seguro de que quieres cerrar sesión?',
      'profile.signedOut': 'Sesión cerrada exitosamente',
      'profile.signOutError': 'Error al cerrar sesión',
      'profile.pleaseSignIn': 'Por favor inicia sesión para usar esta función',
      'profile.biometricEnabled': 'Autenticación biométrica habilitada',
      'profile.biometricDisabled': 'Autenticación biométrica deshabilitada',
      'profile.biometricAuthFailed': 'Autenticación biométrica fallida',
      'profile.biometricEnableError': 'Error al habilitar autenticación biométrica',
      'profile.biometricDisableError': 'Error al deshabilitar autenticación biométrica',
      'profile.biometricDesc': 'Usar autenticación biométrica para iniciar sesión',
      'profile.disableBiometric': 'Deshabilitar biométrica',
      'profile.disableBiometricConfirm': '¿Estás seguro de que quieres deshabilitar la autenticación biométrica?',
      'profile.disable': 'Deshabilitar',
      'profile.twoFactor': 'Autenticación de dos factores',
      'profile.twoFactorDesc': 'Agregar una capa adicional de seguridad',
      'profile.twoFactorEnabled': 'Habilitado',
      'profile.twoFaDisabled': 'Autenticación de dos factores deshabilitada',
      'profile.twoFaDisableError': 'Error al deshabilitar autenticación de dos factores',
      'profile.disableTwoFa': 'Deshabilitar 2FA',
      'profile.disableTwoFaConfirm': '¿Estás seguro de que quieres deshabilitar la autenticación de dos factores?',
      
      // Categories
      dairy: 'Lácteos',
      meat: 'Carne',
      fruits: 'Frutas',
      vegetables: 'Verduras',
      grains: 'Granos',
      beverages: 'Bebidas',
      snacks: 'Bocadillos',
      condiments: 'Condimentos',
      frozen: 'Congelados',
      other: 'Otro',
      
      // Units
      pcs: 'pzs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'taza',
      tbsp: 'cdas',
      tsp: 'cdtas',
    },
  },
  zh: {
    translation: {
      // Common
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      confirm: '确认',
      ok: '确定',
      next: '下一步',
      
      // Tabs
      pantry: '食品储藏室',
      planner: '计划',
      shopping: '购物',
      profile: '个人资料',
      
      // Auth
      'auth.signIn': '登录',
      'auth.signUp': '注册',
      'auth.signOut': '退出登录',
      'auth.notLoggedIn': '未登录',
      'auth.email': '电子邮件',
      'auth.password': '密码',
      
      // Pantry
      'pantry.title': '我的食品储藏室',
      'pantry.addFirst': '添加您的第一个项目',
      'pantry.search': '搜索储藏室...',
      'pantry.addItem': '添加项目',
      'pantry.scanBarcode': '扫描条形码',
      'pantry.foodSearch': '搜索食物',
      'pantry.itemName': '项目名称',
      'pantry.category': '类别',
      'pantry.quantity': '数量',
      'pantry.unit': '单位',
      'pantry.expirationDate': '到期日期',
      'pantry.notes': '备注',
      'pantry.addToPantry': '添加到储藏室',
      'pantry.itemAdded': '项目已添加到储藏室！',
      'pantry.itemDeleted': '项目已删除',
      'pantry.deleteConfirm': '您确定要删除此项目吗？',
      'pantry.expiresIn': '{{days}}天后到期',
      'pantry.expired': '已过期',
      'pantry.fresh': '新鲜',
      'pantry.emptyTitle': '您的储藏室是空的',
      'pantry.emptyDescription': '开始添加项目以跟踪您的食品库存',
      
      // Barcode Scanner
      scanBarcodeTitle: '扫描条形码',
      cameraPermission: '需要相机权限',
      cameraPermissionText: '我们需要访问您的相机以扫描条形码',
      grantPermission: '授予权限',
      positionBarcode: '将条形码放在框架内',
      lookingUp: '正在查找产品...',
      scanAgain: '点击再次扫描',
      productFound: '找到产品！',
      productNotFound: '未找到产品',
      productNotFoundText: '在数据库中未找到此条形码。请手动添加项目。',
      addManually: '手动添加',
      tryAgain: '重试',
      addToPantry: '添加到储藏室',
      
      // Planner
      'planner.title': '膳食计划',
      'planner.myRecipes': '我的食谱',
      'planner.aiSuggestions': 'AI建议',
      'planner.getAiSuggestions': '获取AI食谱建议',
      'planner.basedOnPantry': '基于您的储藏室项目',
      'planner.noRecipes': '还没有食谱',
      'planner.addRecipeHint': '添加食谱以开始计划膳食',
      'planner.ingredientsAvailable': '{{count}}种食材可用',
      
      // Shopping
      'shopping.title': '购物清单',
      'shopping.addNewItem': '添加新项目',
      'shopping.itemsCompleted': '{{count}}个项目已完成',
      'shopping.clearCompleted': '清除已完成',
      'shopping.noShoppingItems': '您的购物清单是空的',
      'shopping.addItemsHint': '添加您需要购买的项目',
      
      // Profile
      'profile.title': '个人资料',
      'profile.statistics': '统计',
      'profile.totalItems': '总项目',
      'profile.expiringSoon': '即将过期',
      'profile.expired': '已过期',
      'profile.security': '安全',
      'profile.settings': '设置',
      'profile.language': '语言',
      'profile.languageDesc': '更改应用语言',
      'profile.notifications': '通知',
      'profile.notificationsDesc': '管理通知偏好',
      'profile.about': '关于',
      'profile.aboutDesc': '应用信息和支持',
      'profile.tutorial': '教程',
      'profile.tutorialDesc': '再次查看应用教程',
      'profile.signOut': '退出登录',
      'profile.signOutConfirm': '您确定要退出登录吗？',
      'profile.signedOut': '成功退出登录',
      'profile.signOutError': '退出登录失败',
      'profile.pleaseSignIn': '请登录以使用此功能',
      'profile.biometricEnabled': '生物识别认证已启用',
      'profile.biometricDisabled': '生物识别认证已禁用',
      'profile.biometricAuthFailed': '生物识别认证失败',
      'profile.biometricEnableError': '启用生物识别认证失败',
      'profile.biometricDisableError': '禁用生物识别认证失败',
      'profile.biometricDesc': '使用生物识别认证登录',
      'profile.disableBiometric': '禁用生物识别',
      'profile.disableBiometricConfirm': '您确定要禁用生物识别认证吗？',
      'profile.disable': '禁用',
      'profile.twoFactor': '双因素认证',
      'profile.twoFactorDesc': '添加额外的安全层',
      'profile.twoFactorEnabled': '已启用',
      'profile.twoFaDisabled': '双因素认证已禁用',
      'profile.twoFaDisableError': '禁用双因素认证失败',
      'profile.disableTwoFa': '禁用2FA',
      'profile.disableTwoFaConfirm': '您确定要禁用双因素认证吗？',
      
      // Categories
      dairy: '乳制品',
      meat: '肉类',
      fruits: '水果',
      vegetables: '蔬菜',
      grains: '谷物',
      beverages: '饮料',
      snacks: '零食',
      condiments: '调味品',
      frozen: '冷冻食品',
      other: '其他',
      
      // Units
      pcs: '个',
      kg: '千克',
      g: '克',
      lb: '磅',
      oz: '盎司',
      l: '升',
      ml: '毫升',
      cup: '杯',
      tbsp: '汤匙',
      tsp: '茶匙',
    },
  },
  ja: {
    translation: {
      // Common
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      confirm: '確認',
      ok: 'OK',
      next: '次へ',
      
      // Tabs
      pantry: 'パントリー',
      planner: 'プランナー',
      shopping: '買い物',
      profile: 'プロフィール',
      
      // Auth
      'auth.signIn': 'サインイン',
      'auth.signUp': 'サインアップ',
      'auth.signOut': 'サインアウト',
      'auth.notLoggedIn': 'ログインしていません',
      'auth.email': 'メールアドレス',
      'auth.password': 'パスワード',
      
      // Pantry
      'pantry.title': 'マイパントリー',
      'pantry.addFirst': '最初のアイテムを追加',
      'pantry.search': 'パントリーを検索...',
      'pantry.addItem': 'アイテムを追加',
      'pantry.scanBarcode': 'バーコードをスキャン',
      'pantry.foodSearch': '食品を検索',
      'pantry.itemName': 'アイテム名',
      'pantry.category': 'カテゴリー',
      'pantry.quantity': '数量',
      'pantry.unit': '単位',
      'pantry.expirationDate': '賞味期限',
      'pantry.notes': 'メモ',
      'pantry.addToPantry': 'パントリーに追加',
      'pantry.itemAdded': 'アイテムがパントリーに追加されました！',
      'pantry.itemDeleted': 'アイテムが削除されました',
      'pantry.deleteConfirm': 'このアイテムを削除してもよろしいですか？',
      'pantry.expiresIn': '{{days}}日後に期限切れ',
      'pantry.expired': '期限切れ',
      'pantry.fresh': '新鮮',
      'pantry.emptyTitle': 'パントリーは空です',
      'pantry.emptyDescription': 'アイテムを追加して食品在庫を追跡しましょう',
      
      // Barcode Scanner
      scanBarcodeTitle: 'バーコードをスキャン',
      cameraPermission: 'カメラの許可が必要です',
      cameraPermissionText: 'バーコードをスキャンするにはカメラへのアクセスが必要です',
      grantPermission: '許可を与える',
      positionBarcode: 'バーコードをフレーム内に配置してください',
      lookingUp: '製品を検索中...',
      scanAgain: 'タップして再スキャン',
      productFound: '製品が見つかりました！',
      productNotFound: '製品が見つかりません',
      productNotFoundText: 'このバーコードはデータベースに見つかりませんでした。手動でアイテムを追加してください。',
      addManually: '手動で追加',
      tryAgain: '再試行',
      addToPantry: 'パントリーに追加',
      
      // Planner
      'planner.title': '食事プランナー',
      'planner.myRecipes': 'マイレシピ',
      'planner.aiSuggestions': 'AI提案',
      'planner.getAiSuggestions': 'AIレシピ提案を取得',
      'planner.basedOnPantry': 'パントリーのアイテムに基づく',
      'planner.noRecipes': 'まだレシピがありません',
      'planner.addRecipeHint': 'レシピを追加して食事の計画を始めましょう',
      'planner.ingredientsAvailable': '{{count}}種類の食材が利用可能',
      
      // Shopping
      'shopping.title': '買い物リスト',
      'shopping.addNewItem': '新しいアイテムを追加',
      'shopping.itemsCompleted': '{{count}}個のアイテムが完了',
      'shopping.clearCompleted': '完了したものをクリア',
      'shopping.noShoppingItems': '買い物リストは空です',
      'shopping.addItemsHint': '購入する必要のあるアイテムを追加',
      
      // Profile
      'profile.title': 'プロフィール',
      'profile.statistics': '統計',
      'profile.totalItems': '総アイテム',
      'profile.expiringSoon': 'まもなく期限切れ',
      'profile.expired': '期限切れ',
      'profile.security': 'セキュリティ',
      'profile.settings': '設定',
      'profile.language': '言語',
      'profile.languageDesc': 'アプリの言語を変更',
      'profile.notifications': '通知',
      'profile.notificationsDesc': '通知設定を管理',
      'profile.about': 'について',
      'profile.aboutDesc': 'アプリ情報とサポート',
      'profile.tutorial': 'チュートリアル',
      'profile.tutorialDesc': 'アプリのチュートリアルを再度表示',
      'profile.signOut': 'サインアウト',
      'profile.signOutConfirm': 'サインアウトしてもよろしいですか？',
      'profile.signedOut': 'サインアウトしました',
      'profile.signOutError': 'サインアウトに失敗しました',
      'profile.pleaseSignIn': 'この機能を使用するにはサインインしてください',
      'profile.biometricEnabled': '生体認証が有効になりました',
      'profile.biometricDisabled': '生体認証が無効になりました',
      'profile.biometricAuthFailed': '生体認証に失敗しました',
      'profile.biometricEnableError': '生体認証の有効化に失敗しました',
      'profile.biometricDisableError': '生体認証の無効化に失敗しました',
      'profile.biometricDesc': '生体認証を使用してサインイン',
      'profile.disableBiometric': '生体認証を無効化',
      'profile.disableBiometricConfirm': '生体認証を無効化してもよろしいですか？',
      'profile.disable': '無効化',
      'profile.twoFactor': '二要素認証',
      'profile.twoFactorDesc': '追加のセキュリティ層を追加',
      'profile.twoFactorEnabled': '有効',
      'profile.twoFaDisabled': '二要素認証が無効になりました',
      'profile.twoFaDisableError': '二要素認証の無効化に失敗しました',
      'profile.disableTwoFa': '2FAを無効化',
      'profile.disableTwoFaConfirm': '二要素認証を無効化してもよろしいですか？',
      
      // Categories
      dairy: '乳製品',
      meat: '肉',
      fruits: '果物',
      vegetables: '野菜',
      grains: '穀物',
      beverages: '飲料',
      snacks: 'スナック',
      condiments: '調味料',
      frozen: '冷凍食品',
      other: 'その他',
      
      // Units
      pcs: '個',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'カップ',
      tbsp: '大さじ',
      tsp: '小さじ',
    },
  },
  de: {
    translation: {
      // Common
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'Bestätigen',
      ok: 'OK',
      next: 'Weiter',
      
      // Tabs
      pantry: 'Vorratskammer',
      planner: 'Planer',
      shopping: 'Einkaufen',
      profile: 'Profil',
      
      // Auth
      'auth.signIn': 'Anmelden',
      'auth.signUp': 'Registrieren',
      'auth.signOut': 'Abmelden',
      'auth.notLoggedIn': 'Nicht angemeldet',
      'auth.email': 'E-Mail',
      'auth.password': 'Passwort',
      
      // Pantry
      'pantry.title': 'Meine Vorratskammer',
      'pantry.addFirst': 'Fügen Sie Ihr erstes Element hinzu',
      'pantry.search': 'Vorratskammer durchsuchen...',
      'pantry.addItem': 'Element hinzufügen',
      'pantry.scanBarcode': 'Barcode scannen',
      'pantry.foodSearch': 'Lebensmittel suchen',
      'pantry.itemName': 'Elementname',
      'pantry.category': 'Kategorie',
      'pantry.quantity': 'Menge',
      'pantry.unit': 'Einheit',
      'pantry.expirationDate': 'Ablaufdatum',
      'pantry.notes': 'Notizen',
      'pantry.addToPantry': 'Zur Vorratskammer hinzufügen',
      'pantry.itemAdded': 'Element zur Vorratskammer hinzugefügt!',
      'pantry.itemDeleted': 'Element gelöscht',
      'pantry.deleteConfirm': 'Möchten Sie dieses Element wirklich löschen?',
      'pantry.expiresIn': 'Läuft in {{days}} Tagen ab',
      'pantry.expired': 'Abgelaufen',
      'pantry.fresh': 'Frisch',
      'pantry.emptyTitle': 'Ihre Vorratskammer ist leer',
      'pantry.emptyDescription': 'Beginnen Sie mit dem Hinzufügen von Elementen, um Ihr Lebensmittelinventar zu verfolgen',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Barcode scannen',
      cameraPermission: 'Kameraberechtigung erforderlich',
      cameraPermissionText: 'Wir benötigen Zugriff auf Ihre Kamera, um Barcodes zu scannen',
      grantPermission: 'Berechtigung erteilen',
      positionBarcode: 'Positionieren Sie den Barcode im Rahmen',
      lookingUp: 'Produkt wird gesucht...',
      scanAgain: 'Tippen Sie, um erneut zu scannen',
      productFound: 'Produkt gefunden!',
      productNotFound: 'Produkt nicht gefunden',
      productNotFoundText: 'Dieser Barcode wurde in der Datenbank nicht gefunden. Bitte fügen Sie das Element manuell hinzu.',
      addManually: 'Manuell hinzufügen',
      tryAgain: 'Erneut versuchen',
      addToPantry: 'Zur Vorratskammer hinzufügen',
      
      // Planner
      'planner.title': 'Essensplaner',
      'planner.myRecipes': 'Meine Rezepte',
      'planner.aiSuggestions': 'KI-Vorschläge',
      'planner.getAiSuggestions': 'KI-Rezeptvorschläge erhalten',
      'planner.basedOnPantry': 'Basierend auf Ihren Vorratskammer-Elementen',
      'planner.noRecipes': 'Noch keine Rezepte',
      'planner.addRecipeHint': 'Fügen Sie Rezepte hinzu, um mit der Essensplanung zu beginnen',
      'planner.ingredientsAvailable': '{{count}} Zutaten verfügbar',
      
      // Shopping
      'shopping.title': 'Einkaufsliste',
      'shopping.addNewItem': 'Neues Element hinzufügen',
      'shopping.itemsCompleted': '{{count}} Elemente abgeschlossen',
      'shopping.clearCompleted': 'Abgeschlossene löschen',
      'shopping.noShoppingItems': 'Ihre Einkaufsliste ist leer',
      'shopping.addItemsHint': 'Fügen Sie Elemente hinzu, die Sie kaufen müssen',
      
      // Profile
      'profile.title': 'Profil',
      'profile.statistics': 'Statistiken',
      'profile.totalItems': 'Gesamtelemente',
      'profile.expiringSoon': 'Läuft bald ab',
      'profile.expired': 'Abgelaufen',
      'profile.security': 'Sicherheit',
      'profile.settings': 'Einstellungen',
      'profile.language': 'Sprache',
      'profile.languageDesc': 'App-Sprache ändern',
      'profile.notifications': 'Benachrichtigungen',
      'profile.notificationsDesc': 'Benachrichtigungseinstellungen verwalten',
      'profile.about': 'Über',
      'profile.aboutDesc': 'App-Informationen und Support',
      'profile.tutorial': 'Tutorial',
      'profile.tutorialDesc': 'App-Tutorial erneut anzeigen',
      'profile.signOut': 'Abmelden',
      'profile.signOutConfirm': 'Möchten Sie sich wirklich abmelden?',
      'profile.signedOut': 'Erfolgreich abgemeldet',
      'profile.signOutError': 'Abmeldung fehlgeschlagen',
      'profile.pleaseSignIn': 'Bitte melden Sie sich an, um diese Funktion zu nutzen',
      'profile.biometricEnabled': 'Biometrische Authentifizierung aktiviert',
      'profile.biometricDisabled': 'Biometrische Authentifizierung deaktiviert',
      'profile.biometricAuthFailed': 'Biometrische Authentifizierung fehlgeschlagen',
      'profile.biometricEnableError': 'Fehler beim Aktivieren der biometrischen Authentifizierung',
      'profile.biometricDisableError': 'Fehler beim Deaktivieren der biometrischen Authentifizierung',
      'profile.biometricDesc': 'Biometrische Authentifizierung zum Anmelden verwenden',
      'profile.disableBiometric': 'Biometrie deaktivieren',
      'profile.disableBiometricConfirm': 'Möchten Sie die biometrische Authentifizierung wirklich deaktivieren?',
      'profile.disable': 'Deaktivieren',
      'profile.twoFactor': 'Zwei-Faktor-Authentifizierung',
      'profile.twoFactorDesc': 'Zusätzliche Sicherheitsebene hinzufügen',
      'profile.twoFactorEnabled': 'Aktiviert',
      'profile.twoFaDisabled': 'Zwei-Faktor-Authentifizierung deaktiviert',
      'profile.twoFaDisableError': 'Fehler beim Deaktivieren der Zwei-Faktor-Authentifizierung',
      'profile.disableTwoFa': '2FA deaktivieren',
      'profile.disableTwoFaConfirm': 'Möchten Sie die Zwei-Faktor-Authentifizierung wirklich deaktivieren?',
      
      // Categories
      dairy: 'Milchprodukte',
      meat: 'Fleisch',
      fruits: 'Früchte',
      vegetables: 'Gemüse',
      grains: 'Getreide',
      beverages: 'Getränke',
      snacks: 'Snacks',
      condiments: 'Gewürze',
      frozen: 'Tiefkühlkost',
      other: 'Andere',
      
      // Units
      pcs: 'Stk',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'Tasse',
      tbsp: 'EL',
      tsp: 'TL',
    },
  },
  nl: {
    translation: {
      // Common
      cancel: 'Annuleren',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      add: 'Toevoegen',
      search: 'Zoeken',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      confirm: 'Bevestigen',
      ok: 'OK',
      next: 'Volgende',
      
      // Tabs
      pantry: 'Voorraadkast',
      planner: 'Planner',
      shopping: 'Boodschappen',
      profile: 'Profiel',
      
      // Auth
      'auth.signIn': 'Inloggen',
      'auth.signUp': 'Registreren',
      'auth.signOut': 'Uitloggen',
      'auth.notLoggedIn': 'Niet ingelogd',
      'auth.email': 'E-mail',
      'auth.password': 'Wachtwoord',
      
      // Pantry
      'pantry.title': 'Mijn Voorraadkast',
      'pantry.addFirst': 'Voeg uw eerste item toe',
      'pantry.search': 'Voorraadkast doorzoeken...',
      'pantry.addItem': 'Item toevoegen',
      'pantry.scanBarcode': 'Barcode scannen',
      'pantry.foodSearch': 'Voedsel zoeken',
      'pantry.itemName': 'Itemnaam',
      'pantry.category': 'Categorie',
      'pantry.quantity': 'Hoeveelheid',
      'pantry.unit': 'Eenheid',
      'pantry.expirationDate': 'Vervaldatum',
      'pantry.notes': 'Notities',
      'pantry.addToPantry': 'Toevoegen aan voorraadkast',
      'pantry.itemAdded': 'Item toegevoegd aan voorraadkast!',
      'pantry.itemDeleted': 'Item verwijderd',
      'pantry.deleteConfirm': 'Weet u zeker dat u dit item wilt verwijderen?',
      'pantry.expiresIn': 'Verloopt over {{days}} dagen',
      'pantry.expired': 'Verlopen',
      'pantry.fresh': 'Vers',
      'pantry.emptyTitle': 'Uw voorraadkast is leeg',
      'pantry.emptyDescription': 'Begin met het toevoegen van items om uw voedselvoorraad bij te houden',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Barcode scannen',
      cameraPermission: 'Cameratoestemming vereist',
      cameraPermissionText: 'We hebben toegang tot uw camera nodig om barcodes te scannen',
      grantPermission: 'Toestemming verlenen',
      positionBarcode: 'Plaats de barcode binnen het kader',
      lookingUp: 'Product opzoeken...',
      scanAgain: 'Tik om opnieuw te scannen',
      productFound: 'Product gevonden!',
      productNotFound: 'Product niet gevonden',
      productNotFoundText: 'Deze barcode is niet gevonden in de database. Voeg het item handmatig toe.',
      addManually: 'Handmatig toevoegen',
      tryAgain: 'Opnieuw proberen',
      addToPantry: 'Toevoegen aan voorraadkast',
      
      // Planner
      'planner.title': 'Maaltijdplanner',
      'planner.myRecipes': 'Mijn recepten',
      'planner.aiSuggestions': 'AI-suggesties',
      'planner.getAiSuggestions': 'AI-receptsuggesties krijgen',
      'planner.basedOnPantry': 'Gebaseerd op uw voorraadkast items',
      'planner.noRecipes': 'Nog geen recepten',
      'planner.addRecipeHint': 'Voeg recepten toe om te beginnen met het plannen van maaltijden',
      'planner.ingredientsAvailable': '{{count}} ingrediënten beschikbaar',
      
      // Shopping
      'shopping.title': 'Boodschappenlijst',
      'shopping.addNewItem': 'Nieuw item toevoegen',
      'shopping.itemsCompleted': '{{count}} items voltooid',
      'shopping.clearCompleted': 'Voltooide wissen',
      'shopping.noShoppingItems': 'Uw boodschappenlijst is leeg',
      'shopping.addItemsHint': 'Voeg items toe die u moet kopen',
      
      // Profile
      'profile.title': 'Profiel',
      'profile.statistics': 'Statistieken',
      'profile.totalItems': 'Totaal items',
      'profile.expiringSoon': 'Verloopt binnenkort',
      'profile.expired': 'Verlopen',
      'profile.security': 'Beveiliging',
      'profile.settings': 'Instellingen',
      'profile.language': 'Taal',
      'profile.languageDesc': 'App-taal wijzigen',
      'profile.notifications': 'Meldingen',
      'profile.notificationsDesc': 'Meldingsinstellingen beheren',
      'profile.about': 'Over',
      'profile.aboutDesc': 'App-informatie en ondersteuning',
      'profile.tutorial': 'Tutorial',
      'profile.tutorialDesc': 'App-tutorial opnieuw bekijken',
      'profile.signOut': 'Uitloggen',
      'profile.signOutConfirm': 'Weet u zeker dat u wilt uitloggen?',
      'profile.signedOut': 'Succesvol uitgelogd',
      'profile.signOutError': 'Uitloggen mislukt',
      'profile.pleaseSignIn': 'Log in om deze functie te gebruiken',
      'profile.biometricEnabled': 'Biometrische authenticatie ingeschakeld',
      'profile.biometricDisabled': 'Biometrische authenticatie uitgeschakeld',
      'profile.biometricAuthFailed': 'Biometrische authenticatie mislukt',
      'profile.biometricEnableError': 'Fout bij inschakelen biometrische authenticatie',
      'profile.biometricDisableError': 'Fout bij uitschakelen biometrische authenticatie',
      'profile.biometricDesc': 'Gebruik biometrische authenticatie om in te loggen',
      'profile.disableBiometric': 'Biometrie uitschakelen',
      'profile.disableBiometricConfirm': 'Weet u zeker dat u biometrische authenticatie wilt uitschakelen?',
      'profile.disable': 'Uitschakelen',
      'profile.twoFactor': 'Twee-factor authenticatie',
      'profile.twoFactorDesc': 'Extra beveiligingslaag toevoegen',
      'profile.twoFactorEnabled': 'Ingeschakeld',
      'profile.twoFaDisabled': 'Twee-factor authenticatie uitgeschakeld',
      'profile.twoFaDisableError': 'Fout bij uitschakelen twee-factor authenticatie',
      'profile.disableTwoFa': '2FA uitschakelen',
      'profile.disableTwoFaConfirm': 'Weet u zeker dat u twee-factor authenticatie wilt uitschakelen?',
      
      // Categories
      dairy: 'Zuivel',
      meat: 'Vlees',
      fruits: 'Fruit',
      vegetables: 'Groenten',
      grains: 'Granen',
      beverages: 'Dranken',
      snacks: 'Snacks',
      condiments: 'Kruiden',
      frozen: 'Diepvries',
      other: 'Andere',
      
      // Units
      pcs: 'stk',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'kop',
      tbsp: 'el',
      tsp: 'tl',
    },
  },
  fr: {
    translation: {
      // Common
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      ok: 'OK',
      next: 'Suivant',
      
      // Tabs
      pantry: 'Garde-manger',
      planner: 'Planificateur',
      shopping: 'Courses',
      profile: 'Profil',
      
      // Auth
      'auth.signIn': 'Se connecter',
      'auth.signUp': 'S\'inscrire',
      'auth.signOut': 'Se déconnecter',
      'auth.notLoggedIn': 'Non connecté',
      'auth.email': 'E-mail',
      'auth.password': 'Mot de passe',
      
      // Pantry
      'pantry.title': 'Mon Garde-manger',
      'pantry.addFirst': 'Ajoutez votre premier article',
      'pantry.search': 'Rechercher dans le garde-manger...',
      'pantry.addItem': 'Ajouter un article',
      'pantry.scanBarcode': 'Scanner le code-barres',
      'pantry.foodSearch': 'Rechercher des aliments',
      'pantry.itemName': 'Nom de l\'article',
      'pantry.category': 'Catégorie',
      'pantry.quantity': 'Quantité',
      'pantry.unit': 'Unité',
      'pantry.expirationDate': 'Date d\'expiration',
      'pantry.notes': 'Notes',
      'pantry.addToPantry': 'Ajouter au garde-manger',
      'pantry.itemAdded': 'Article ajouté au garde-manger!',
      'pantry.itemDeleted': 'Article supprimé',
      'pantry.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cet article?',
      'pantry.expiresIn': 'Expire dans {{days}} jours',
      'pantry.expired': 'Expiré',
      'pantry.fresh': 'Frais',
      'pantry.emptyTitle': 'Votre garde-manger est vide',
      'pantry.emptyDescription': 'Commencez par ajouter des articles pour suivre votre inventaire alimentaire',
      
      // Barcode Scanner
      scanBarcodeTitle: 'Scanner le code-barres',
      cameraPermission: 'Autorisation de caméra requise',
      cameraPermissionText: 'Nous avons besoin d\'accéder à votre caméra pour scanner les codes-barres',
      grantPermission: 'Accorder l\'autorisation',
      positionBarcode: 'Positionnez le code-barres dans le cadre',
      lookingUp: 'Recherche du produit...',
      scanAgain: 'Appuyez pour scanner à nouveau',
      productFound: 'Produit trouvé!',
      productNotFound: 'Produit non trouvé',
      productNotFoundText: 'Ce code-barres n\'a pas été trouvé dans la base de données. Veuillez ajouter l\'article manuellement.',
      addManually: 'Ajouter manuellement',
      tryAgain: 'Réessayer',
      addToPantry: 'Ajouter au garde-manger',
      
      // Planner
      'planner.title': 'Planificateur de repas',
      'planner.myRecipes': 'Mes recettes',
      'planner.aiSuggestions': 'Suggestions IA',
      'planner.getAiSuggestions': 'Obtenir des suggestions de recettes IA',
      'planner.basedOnPantry': 'Basé sur les articles de votre garde-manger',
      'planner.noRecipes': 'Pas encore de recettes',
      'planner.addRecipeHint': 'Ajoutez des recettes pour commencer à planifier les repas',
      'planner.ingredientsAvailable': '{{count}} ingrédients disponibles',
      
      // Shopping
      'shopping.title': 'Liste de courses',
      'shopping.addNewItem': 'Ajouter un nouvel article',
      'shopping.itemsCompleted': '{{count}} articles terminés',
      'shopping.clearCompleted': 'Effacer les terminés',
      'shopping.noShoppingItems': 'Votre liste de courses est vide',
      'shopping.addItemsHint': 'Ajoutez des articles que vous devez acheter',
      
      // Profile
      'profile.title': 'Profil',
      'profile.statistics': 'Statistiques',
      'profile.totalItems': 'Total des articles',
      'profile.expiringSoon': 'Expire bientôt',
      'profile.expired': 'Expiré',
      'profile.security': 'Sécurité',
      'profile.settings': 'Paramètres',
      'profile.language': 'Langue',
      'profile.languageDesc': 'Changer la langue de l\'application',
      'profile.notifications': 'Notifications',
      'profile.notificationsDesc': 'Gérer les préférences de notification',
      'profile.about': 'À propos',
      'profile.aboutDesc': 'Informations sur l\'application et support',
      'profile.tutorial': 'Tutoriel',
      'profile.tutorialDesc': 'Revoir le tutoriel de l\'application',
      'profile.signOut': 'Se déconnecter',
      'profile.signOutConfirm': 'Êtes-vous sûr de vouloir vous déconnecter?',
      'profile.signedOut': 'Déconnecté avec succès',
      'profile.signOutError': 'Échec de la déconnexion',
      'profile.pleaseSignIn': 'Veuillez vous connecter pour utiliser cette fonctionnalité',
      'profile.biometricEnabled': 'Authentification biométrique activée',
      'profile.biometricDisabled': 'Authentification biométrique désactivée',
      'profile.biometricAuthFailed': 'Authentification biométrique échouée',
      'profile.biometricEnableError': 'Erreur lors de l\'activation de l\'authentification biométrique',
      'profile.biometricDisableError': 'Erreur lors de la désactivation de l\'authentification biométrique',
      'profile.biometricDesc': 'Utiliser l\'authentification biométrique pour se connecter',
      'profile.disableBiometric': 'Désactiver la biométrie',
      'profile.disableBiometricConfirm': 'Êtes-vous sûr de vouloir désactiver l\'authentification biométrique?',
      'profile.disable': 'Désactiver',
      'profile.twoFactor': 'Authentification à deux facteurs',
      'profile.twoFactorDesc': 'Ajouter une couche de sécurité supplémentaire',
      'profile.twoFactorEnabled': 'Activé',
      'profile.twoFaDisabled': 'Authentification à deux facteurs désactivée',
      'profile.twoFaDisableError': 'Erreur lors de la désactivation de l\'authentification à deux facteurs',
      'profile.disableTwoFa': 'Désactiver 2FA',
      'profile.disableTwoFaConfirm': 'Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs?',
      
      // Categories
      dairy: 'Produits laitiers',
      meat: 'Viande',
      fruits: 'Fruits',
      vegetables: 'Légumes',
      grains: 'Céréales',
      beverages: 'Boissons',
      snacks: 'Collations',
      condiments: 'Condiments',
      frozen: 'Surgelés',
      other: 'Autre',
      
      // Units
      pcs: 'pcs',
      kg: 'kg',
      g: 'g',
      lb: 'lb',
      oz: 'oz',
      l: 'L',
      ml: 'mL',
      cup: 'tasse',
      tbsp: 'c. à s.',
      tsp: 'c. à c.',
    },
  },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      console.log('Loaded saved language:', savedLanguage);
      return savedLanguage;
    }
    
    // Get device locale
    const deviceLocale = Localization.getLocales()[0];
    const languageCode = deviceLocale.languageCode || 'en';
    console.log('Using device language:', languageCode);
    
    // Map language codes to supported languages
    if (resources[languageCode as keyof typeof resources]) {
      return languageCode;
    }
    
    return 'en';
  } catch (error) {
    console.error('Error getting initial language:', error);
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
      react: {
        useSuspense: false,
      },
    });
  
  console.log('i18n initialized with language:', initialLanguage);
};

initI18n();

// Save language preference and trigger app-wide update
export const changeLanguage = async (languageCode: string) => {
  try {
    console.log('Changing language to:', languageCode);
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    console.log('Language changed successfully to:', languageCode);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];
};

export default i18n;
