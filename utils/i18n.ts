
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@nutrion_language';

// Translation resources
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
      auth: {
        emailAddress: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm password',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        createAccount: 'Create your account',
        welcomeBack: 'Welcome back!',
        welcome: 'Welcome!',
        forgotPassword: 'Forgot Password',
        forgotPasswordDesc: 'Enter your email address and we&apos;ll send you a link to reset your password.',
        sendResetLink: 'Send Reset Link',
        resetPasswordEmailSent: 'We&apos;ve sent a password reset link to your email. Please check your inbox.',
        checkEmail: 'Check Your Email',
        backToLogin: 'Back to Login',
        resetPasswordInfo: 'You&apos;ll receive an email with instructions to reset your password within a few minutes.',
        enterEmail: 'Please enter your email address',
        invalidEmail: 'Please enter a valid email address',
        resetPasswordError: 'Failed to send reset email',
        unexpectedError: 'An unexpected error occurred',
        fillAllFields: 'Please fill in all fields',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 6 characters',
        signInFailed: 'Failed to sign in',
        signUpFailed: 'Failed to sign up',
        verifyEmail: 'Verify Your Email',
        verifyEmailMessage: 'We&apos;ve sent a verification link to your email. Please check your inbox and verify your email address before signing in.',
        accountCreated: 'Account created successfully!',
        googleSignInFailed: 'Failed to sign in with Google',
        signInInProgress: 'Sign in is already in progress',
        playServicesNotAvailable: 'Play services not available or outdated',
        orContinueWith: 'or continue with',
        signInWithGoogle: 'Sign in with Google',
        noAccount: 'Don&apos;t have an account?',
        haveAccount: 'Already have an account?',
        skipForNow: 'Skip for now',
        signInWith: 'Sign in with',
        biometricLoginFailed: 'Biometric login failed. Please sign in with your password.',
        noCredentialsSaved: 'No credentials saved. Please sign in with your password first.',
        biometricAuthFailed: 'Biometric authentication failed',
        biometricAuthError: 'An error occurred during biometric authentication',
        notLoggedIn: 'Not logged in',
        setup2fa: 'Setup Two-Factor Authentication',
        scanQRCode: 'Scan QR Code',
        scanQRCodeDesc: 'Use an authenticator app like Google Authenticator or Authy to scan this QR code.',
        manualEntry: 'Or enter this code manually:',
        verifyCode: 'Verify Code',
        verifyCodeDesc: 'Enter the 6-digit code from your authenticator app to verify setup.',
        verify: 'Verify',
        back: 'Back',
        backupCodes: 'Save Backup Codes',
        backupCodesDesc: 'Save these backup codes in a safe place. You can use them to access your account if you lose your device.',
        backupCodesWarning: 'These codes will only be shown once. Make sure to save them securely.',
        done: 'Done',
        twoFaSetupError: 'Failed to setup 2FA',
        enter6DigitCode: 'Please enter a 6-digit code',
        twoFaSaveError: 'Failed to save 2FA settings',
        twoFaEnabled: 'Two-factor authentication enabled!',
        twoFaVerifyError: 'Failed to verify 2FA code',
      },
      
      // Pantry
      pantryTitle: 'My Pantry',
      addItem: 'Add Item',
      scanBarcode: 'Scan Barcode',
      foodSearch: 'Food Search',
      itemName: 'Item Name',
      category: 'Category',
      quantity: 'Quantity',
      unit: 'Unit',
      expirationDate: 'Expiration Date',
      notes: 'Notes',
      addToPantry: 'Add to Pantry',
      itemAdded: 'Item added to pantry!',
      itemDeleted: 'Item deleted',
      deleteConfirm: 'Are you sure you want to delete this item?',
      expiresIn: 'Expires in {{days}} days',
      expired: 'Expired',
      fresh: 'Fresh',
      
      // Food Search
      searchPlaceholder: 'Search for food (e.g., banana, chicken)...',
      noResults: 'No results found',
      tryDifferent: 'Try searching for a different food item',
      searchForFoods: 'Search for Foods',
      searchHint: 'Type at least 2 characters to see smart food suggestions',
      resultsFor: '{{count}} results for "{{query}}"',
      
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
      
      // Planner
      plannerTitle: 'Meal Planner',
      myRecipes: 'My Recipes',
      aiSuggestions: 'AI Suggestions',
      getAiSuggestions: 'Get AI Recipe Suggestions',
      basedOnPantry: 'Based on your pantry items',
      noRecipes: 'No recipes yet',
      addRecipeHint: 'Add recipes to start planning meals',
      
      // Shopping
      shoppingTitle: 'Shopping List',
      addNewItem: 'Add New Item',
      itemsCompleted: '{{count}} items completed',
      clearCompleted: 'Clear Completed',
      noShoppingItems: 'Your shopping list is empty',
      addItemsHint: 'Add items you need to buy',
      
      // Profile
      profile: {
        title: 'Profile',
        statistics: 'Statistics',
        totalItems: 'Total Items',
        expiringSoon: 'Expiring Soon',
        expired: 'Expired',
        security: 'Security',
        settings: 'Settings',
        account: 'Account',
        notifications: 'Notifications',
        notificationsDesc: 'Manage expiration alerts',
        notificationsComingSoon: 'Notification settings coming soon!',
        language: 'Language',
        languageDesc: 'Change app language',
        tutorial: 'View Tutorial',
        tutorialDesc: 'See the introduction again',
        about: 'About',
        aboutDesc: 'App information',
        aboutNutrion: 'About Nutrion',
        aboutNutrionDesc: 'Nutrion v1.0.0\n\nYour smart kitchen companion for managing food and reducing waste.\n\n© 2024 Nutrion',
        signOut: 'Sign Out',
        signOutDesc: 'Sign out of your account',
        signOutConfirm: 'Are you sure you want to sign out?',
        signOutError: 'Failed to sign out',
        signedOut: 'Signed out successfully',
        biometricDesc: 'Use biometric authentication to sign in',
        biometricEnabled: 'Biometric authentication enabled',
        biometricDisabled: 'Biometric authentication disabled',
        biometricEnableError: 'Failed to enable biometric authentication',
        biometricDisableError: 'Failed to disable biometric authentication',
        biometricAuthFailed: 'Biometric authentication failed',
        disableBiometric: 'Disable Biometric',
        disableBiometricConfirm: 'Are you sure you want to disable biometric authentication?',
        disable: 'Disable',
        twoFactor: 'Two-Factor Authentication',
        twoFactorDesc: 'Add an extra layer of security',
        twoFactorEnabled: 'Enabled',
        disableTwoFa: 'Disable 2FA',
        disableTwoFaConfirm: 'Are you sure you want to disable two-factor authentication?',
        twoFaDisableError: 'Failed to disable 2FA',
        twoFaDisabled: 'Two-factor authentication disabled',
        pleaseSignIn: 'Please sign in to use this feature',
      },
      
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
      
      // Onboarding
      skip: 'Skip',
      getStarted: 'Get Started',
      onboardingOneTitle: 'Smart Pantry Management',
      onboardingOneDesc: 'Track your food inventory with ease. Scan barcodes or add items manually to keep your pantry organized.',
      onboardingTwoTitle: 'Never Waste Food Again',
      onboardingTwoDesc: 'Get timely expiration alerts and smart suggestions to use ingredients before they spoil.',
      onboardingThreeTitle: 'AI-Powered Meal Planning',
      onboardingThreeDesc: 'Discover delicious recipes based on what you already have. Let AI help you plan balanced meals effortlessly.',
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
      auth: {
        emailAddress: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        signIn: 'Iniciar sesión',
        signUp: 'Registrarse',
        signOut: 'Cerrar sesión',
        createAccount: 'Crear tu cuenta',
        welcomeBack: '¡Bienvenido de nuevo!',
        welcome: '¡Bienvenido!',
        forgotPassword: 'Olvidé mi contraseña',
        forgotPasswordDesc: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
        sendResetLink: 'Enviar enlace',
        resetPasswordEmailSent: 'Hemos enviado un enlace de restablecimiento a tu correo. Por favor revisa tu bandeja de entrada.',
        checkEmail: 'Revisa tu correo',
        backToLogin: 'Volver al inicio de sesión',
        resetPasswordInfo: 'Recibirás un correo con instrucciones para restablecer tu contraseña en unos minutos.',
        enterEmail: 'Por favor ingresa tu correo electrónico',
        invalidEmail: 'Por favor ingresa un correo electrónico válido',
        resetPasswordError: 'Error al enviar el correo de restablecimiento',
        unexpectedError: 'Ocurrió un error inesperado',
        fillAllFields: 'Por favor completa todos los campos',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
        signInFailed: 'Error al iniciar sesión',
        signUpFailed: 'Error al registrarse',
        verifyEmail: 'Verifica tu correo',
        verifyEmailMessage: 'Hemos enviado un enlace de verificación a tu correo. Por favor revisa tu bandeja de entrada y verifica tu dirección de correo antes de iniciar sesión.',
        accountCreated: '¡Cuenta creada exitosamente!',
        googleSignInFailed: 'Error al iniciar sesión con Google',
        signInInProgress: 'El inicio de sesión ya está en progreso',
        playServicesNotAvailable: 'Servicios de Play no disponibles o desactualizados',
        orContinueWith: 'o continuar con',
        signInWithGoogle: 'Iniciar sesión con Google',
        noAccount: '¿No tienes una cuenta?',
        haveAccount: '¿Ya tienes una cuenta?',
        skipForNow: 'Omitir por ahora',
        signInWith: 'Iniciar sesión con',
        biometricLoginFailed: 'Error en el inicio de sesión biométrico. Por favor inicia sesión con tu contraseña.',
        noCredentialsSaved: 'No hay credenciales guardadas. Por favor inicia sesión con tu contraseña primero.',
        biometricAuthFailed: 'Error en la autenticación biométrica',
        biometricAuthError: 'Ocurrió un error durante la autenticación biométrica',
        notLoggedIn: 'No has iniciado sesión',
        setup2fa: 'Configurar autenticación de dos factores',
        scanQRCode: 'Escanear código QR',
        scanQRCodeDesc: 'Usa una aplicación de autenticación como Google Authenticator o Authy para escanear este código QR.',
        manualEntry: 'O ingresa este código manualmente:',
        verifyCode: 'Verificar código',
        verifyCodeDesc: 'Ingresa el código de 6 dígitos de tu aplicación de autenticación para verificar la configuración.',
        verify: 'Verificar',
        back: 'Atrás',
        backupCodes: 'Guardar códigos de respaldo',
        backupCodesDesc: 'Guarda estos códigos de respaldo en un lugar seguro. Puedes usarlos para acceder a tu cuenta si pierdes tu dispositivo.',
        backupCodesWarning: 'Estos códigos solo se mostrarán una vez. Asegúrate de guardarlos de forma segura.',
        done: 'Listo',
        twoFaSetupError: 'Error al configurar 2FA',
        enter6DigitCode: 'Por favor ingresa un código de 6 dígitos',
        twoFaSaveError: 'Error al guardar la configuración de 2FA',
        twoFaEnabled: '¡Autenticación de dos factores habilitada!',
        twoFaVerifyError: 'Error al verificar el código 2FA',
      },
      
      // Pantry
      pantryTitle: 'Mi Despensa',
      addItem: 'Agregar artículo',
      scanBarcode: 'Escanear código de barras',
      foodSearch: 'Buscar alimentos',
      itemName: 'Nombre del artículo',
      category: 'Categoría',
      quantity: 'Cantidad',
      unit: 'Unidad',
      expirationDate: 'Fecha de vencimiento',
      notes: 'Notas',
      addToPantry: 'Agregar a la despensa',
      itemAdded: '¡Artículo agregado a la despensa!',
      itemDeleted: 'Artículo eliminado',
      deleteConfirm: '¿Estás seguro de que quieres eliminar este artículo?',
      expiresIn: 'Vence en {{days}} días',
      expired: 'Vencido',
      fresh: 'Fresco',
      
      // Food Search
      searchPlaceholder: 'Buscar alimentos (ej. plátano, pollo)...',
      noResults: 'No se encontraron resultados',
      tryDifferent: 'Intenta buscar un alimento diferente',
      searchForFoods: 'Buscar alimentos',
      searchHint: 'Escribe al menos 2 caracteres para ver sugerencias inteligentes',
      resultsFor: '{{count}} resultados para "{{query}}"',
      
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
      
      // Planner
      plannerTitle: 'Planificador de comidas',
      myRecipes: 'Mis recetas',
      aiSuggestions: 'Sugerencias de IA',
      getAiSuggestions: 'Obtener sugerencias de recetas con IA',
      basedOnPantry: 'Basado en los artículos de tu despensa',
      noRecipes: 'Aún no hay recetas',
      addRecipeHint: 'Agrega recetas para comenzar a planificar comidas',
      
      // Shopping
      shoppingTitle: 'Lista de compras',
      addNewItem: 'Agregar nuevo artículo',
      itemsCompleted: '{{count}} artículos completados',
      clearCompleted: 'Limpiar completados',
      noShoppingItems: 'Tu lista de compras está vacía',
      addItemsHint: 'Agrega artículos que necesites comprar',
      
      // Profile
      profile: {
        title: 'Perfil',
        statistics: 'Estadísticas',
        totalItems: 'Artículos totales',
        expiringSoon: 'Vencen pronto',
        expired: 'Vencidos',
        security: 'Seguridad',
        settings: 'Configuración',
        account: 'Cuenta',
        notifications: 'Notificaciones',
        notificationsDesc: 'Administrar alertas de vencimiento',
        notificationsComingSoon: '¡Configuración de notificaciones próximamente!',
        language: 'Idioma',
        languageDesc: 'Cambiar idioma de la aplicación',
        tutorial: 'Ver tutorial',
        tutorialDesc: 'Ver la introducción de nuevo',
        about: 'Acerca de',
        aboutDesc: 'Información de la aplicación',
        aboutNutrion: 'Acerca de Nutrion',
        aboutNutrionDesc: 'Nutrion v1.0.0\n\nTu compañero inteligente de cocina para administrar alimentos y reducir el desperdicio.\n\n© 2024 Nutrion',
        signOut: 'Cerrar sesión',
        signOutDesc: 'Cerrar sesión de tu cuenta',
        signOutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
        signOutError: 'Error al cerrar sesión',
        signedOut: 'Sesión cerrada exitosamente',
        biometricDesc: 'Usar autenticación biométrica para iniciar sesión',
        biometricEnabled: 'Autenticación biométrica habilitada',
        biometricDisabled: 'Autenticación biométrica deshabilitada',
        biometricEnableError: 'Error al habilitar la autenticación biométrica',
        biometricDisableError: 'Error al deshabilitar la autenticación biométrica',
        biometricAuthFailed: 'Error en la autenticación biométrica',
        disableBiometric: 'Deshabilitar biométrico',
        disableBiometricConfirm: '¿Estás seguro de que quieres deshabilitar la autenticación biométrica?',
        disable: 'Deshabilitar',
        twoFactor: 'Autenticación de dos factores',
        twoFactorDesc: 'Agregar una capa adicional de seguridad',
        twoFactorEnabled: 'Habilitado',
        disableTwoFa: 'Deshabilitar 2FA',
        disableTwoFaConfirm: '¿Estás seguro de que quieres deshabilitar la autenticación de dos factores?',
        twoFaDisableError: 'Error al deshabilitar 2FA',
        twoFaDisabled: 'Autenticación de dos factores deshabilitada',
        pleaseSignIn: 'Por favor inicia sesión para usar esta función',
      },
      
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
      
      // Onboarding
      skip: 'Omitir',
      getStarted: 'Comenzar',
      onboardingOneTitle: 'Gestión inteligente de despensa',
      onboardingOneDesc: 'Rastrea tu inventario de alimentos con facilidad. Escanea códigos de barras o agrega artículos manualmente para mantener tu despensa organizada.',
      onboardingTwoTitle: 'Nunca desperdicies comida de nuevo',
      onboardingTwoDesc: 'Recibe alertas oportunas de vencimiento y sugerencias inteligentes para usar ingredientes antes de que se echen a perder.',
      onboardingThreeTitle: 'Planificación de comidas con IA',
      onboardingThreeDesc: 'Descubre deliciosas recetas basadas en lo que ya tienes. Deja que la IA te ayude a planificar comidas balanceadas sin esfuerzo.',
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
      
      // Pantry
      pantryTitle: '我的食品储藏室',
      addItem: '添加物品',
      scanBarcode: '扫描条形码',
      foodSearch: '搜索食物',
      itemName: '物品名称',
      category: '类别',
      quantity: '数量',
      unit: '单位',
      expirationDate: '到期日期',
      notes: '备注',
      addToPantry: '添加到储藏室',
      itemAdded: '物品已添加到储藏室！',
      itemDeleted: '物品已删除',
      deleteConfirm: '您确定要删除此物品吗？',
      expiresIn: '{{days}}天后到期',
      expired: '已过期',
      fresh: '新鲜',
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
      
      // Pantry
      pantryTitle: 'マイパントリー',
      addItem: 'アイテムを追加',
      scanBarcode: 'バーコードをスキャン',
      foodSearch: '食品を検索',
      itemName: 'アイテム名',
      category: 'カテゴリー',
      quantity: '数量',
      unit: '単位',
      expirationDate: '賞味期限',
      notes: 'メモ',
      addToPantry: 'パントリーに追加',
      itemAdded: 'アイテムがパントリーに追加されました！',
      itemDeleted: 'アイテムが削除されました',
      deleteConfirm: 'このアイテムを削除してもよろしいですか？',
      expiresIn: '{{days}}日後に期限切れ',
      expired: '期限切れ',
      fresh: '新鮮',
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
      
      // Pantry
      pantryTitle: 'Meine Vorratskammer',
      addItem: 'Artikel hinzufügen',
      scanBarcode: 'Barcode scannen',
      foodSearch: 'Lebensmittel suchen',
      itemName: 'Artikelname',
      category: 'Kategorie',
      quantity: 'Menge',
      unit: 'Einheit',
      expirationDate: 'Ablaufdatum',
      notes: 'Notizen',
      addToPantry: 'Zur Vorratskammer hinzufügen',
      itemAdded: 'Artikel zur Vorratskammer hinzugefügt!',
      itemDeleted: 'Artikel gelöscht',
      deleteConfirm: 'Möchten Sie diesen Artikel wirklich löschen?',
      expiresIn: 'Läuft in {{days}} Tagen ab',
      expired: 'Abgelaufen',
      fresh: 'Frisch',
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
      
      // Pantry
      pantryTitle: 'Mijn voorraadkast',
      addItem: 'Item toevoegen',
      scanBarcode: 'Barcode scannen',
      foodSearch: 'Voedsel zoeken',
      itemName: 'Itemnaam',
      category: 'Categorie',
      quantity: 'Hoeveelheid',
      unit: 'Eenheid',
      expirationDate: 'Vervaldatum',
      notes: 'Notities',
      addToPantry: 'Toevoegen aan voorraadkast',
      itemAdded: 'Item toegevoegd aan voorraadkast!',
      itemDeleted: 'Item verwijderd',
      deleteConfirm: 'Weet je zeker dat je dit item wilt verwijderen?',
      expiresIn: 'Verloopt over {{days}} dagen',
      expired: 'Verlopen',
      fresh: 'Vers',
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
      
      // Pantry
      pantryTitle: 'Mon garde-manger',
      addItem: 'Ajouter un article',
      scanBarcode: 'Scanner le code-barres',
      foodSearch: 'Rechercher des aliments',
      itemName: 'Nom de l&apos;article',
      category: 'Catégorie',
      quantity: 'Quantité',
      unit: 'Unité',
      expirationDate: 'Date d&apos;expiration',
      notes: 'Notes',
      addToPantry: 'Ajouter au garde-manger',
      itemAdded: 'Article ajouté au garde-manger !',
      itemDeleted: 'Article supprimé',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet article ?',
      expiresIn: 'Expire dans {{days}} jours',
      expired: 'Expiré',
      fresh: 'Frais',
    },
  },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Get device locale
    const deviceLocale = Localization.getLocales()[0];
    const languageCode = deviceLocale.languageCode || 'en';
    
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
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    });
};

initI18n();

// Save language preference
export const changeLanguage = async (languageCode: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    console.log('Language changed to:', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
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
