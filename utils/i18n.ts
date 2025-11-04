
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
      'auth.fillAllFields': 'Please fill all fields',
      'auth.invalidEmail': 'Invalid email address',
      'auth.passwordsDoNotMatch': 'Passwords do not match',
      'auth.passwordTooShort': 'Password must be at least 6 characters',
      'auth.signInFailed': 'Sign in failed',
      'auth.signUpFailed': 'Sign up failed',
      'auth.welcomeBack': 'Welcome back!',
      'auth.verifyEmail': 'Verify Your Email',
      'auth.verifyEmailMessage': 'Please check your email and click the verification link to complete your registration.',
      'auth.accountCreated': 'Account created successfully!',
      'auth.unexpectedError': 'An unexpected error occurred',
      
      // Pantry
      'pantry.title': 'My Pantry',
      'pantry.addFirst': 'Add your first item',
      'pantry.search': 'Search pantry...',
      'pantry.addItem': 'Add Item',
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
      
      // Planner
      'planner.title': 'Meal Planner',
      'planner.myRecipes': 'My Recipes',
      'planner.aiSuggestions': 'AI Suggestions',
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
      'shopping.item': 'item',
      'shopping.items': 'items',
      'shopping.toBuy': 'to buy',
      'shopping.clear': 'Clear',
      'shopping.itemName': 'Item name',
      'shopping.quantity': 'Quantity',
      'shopping.addItem': 'Add Item',
      'shopping.qty': 'Qty',
      'shopping.emptyTitle': 'Shopping list is empty',
      'shopping.emptyDescription': 'Add items you need to buy from the store',
      'shopping.toBuySection': 'To Buy',
      'shopping.completedSection': 'Completed',
      'shopping.loadError': 'Failed to load shopping items',
      'shopping.enterItemName': 'Please enter an item name',
      'shopping.enterValidQuantity': 'Please enter a valid quantity',
      'shopping.addItemError': 'Failed to add item',
      'shopping.updateItemError': 'Failed to update item',
      'shopping.deleteItemError': 'Failed to delete item',
      'shopping.clearCompletedConfirm': 'Remove all checked items from the list?',
      'shopping.clearCompletedError': 'Failed to clear completed items',
      
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
      'profile.twoFactor': 'Two-Factor Authentication',
      'profile.twoFactorDesc': 'Add an extra layer of security',
      'profile.twoFactorEnabled': 'Enabled',
      'profile.twoFaDisabled': 'Two-factor authentication disabled',
      'profile.twoFaDisableError': 'Failed to disable two-factor authentication',
      'profile.disableTwoFa': 'Disable 2FA',
      'profile.disableTwoFaConfirm': 'Are you sure you want to disable two-factor authentication?',
      'profile.disable': 'Disable',
      
      // Food Search
      searchForFoods: 'Search for Foods',
      searchPlaceholder: 'Search for food items...',
      searchHint: 'Type at least 2 characters to search',
      resultsFor: '{{count}} results for "{{query}}"',
      noResults: 'No results found',
      tryDifferent: 'Try a different search term',
      
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
      'auth.fillAllFields': 'Por favor completa todos los campos',
      'auth.invalidEmail': 'Dirección de correo electrónico inválida',
      'auth.passwordsDoNotMatch': 'Las contraseñas no coinciden',
      'auth.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
      'auth.signInFailed': 'Error al iniciar sesión',
      'auth.signUpFailed': 'Error al registrarse',
      'auth.welcomeBack': '¡Bienvenido de nuevo!',
      'auth.verifyEmail': 'Verifica tu correo electrónico',
      'auth.verifyEmailMessage': 'Por favor revisa tu correo electrónico y haz clic en el enlace de verificación para completar tu registro.',
      'auth.accountCreated': '¡Cuenta creada exitosamente!',
      'auth.unexpectedError': 'Ocurrió un error inesperado',
      
      // Pantry
      'pantry.title': 'Mi Despensa',
      'pantry.addFirst': 'Agrega tu primer artículo',
      'pantry.search': 'Buscar en despensa...',
      'pantry.addItem': 'Agregar artículo',
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
      
      // Planner
      'planner.title': 'Planificador de comidas',
      'planner.myRecipes': 'Mis recetas',
      'planner.aiSuggestions': 'Sugerencias de IA',
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
      'shopping.item': 'artículo',
      'shopping.items': 'artículos',
      'shopping.toBuy': 'para comprar',
      'shopping.clear': 'Limpiar',
      'shopping.itemName': 'Nombre del artículo',
      'shopping.quantity': 'Cantidad',
      'shopping.addItem': 'Agregar artículo',
      'shopping.qty': 'Cant',
      'shopping.emptyTitle': 'La lista de compras está vacía',
      'shopping.emptyDescription': 'Agrega artículos que necesites comprar en la tienda',
      'shopping.toBuySection': 'Para comprar',
      'shopping.completedSection': 'Completados',
      'shopping.loadError': 'Error al cargar artículos de compras',
      'shopping.enterItemName': 'Por favor ingresa un nombre de artículo',
      'shopping.enterValidQuantity': 'Por favor ingresa una cantidad válida',
      'shopping.addItemError': 'Error al agregar artículo',
      'shopping.updateItemError': 'Error al actualizar artículo',
      'shopping.deleteItemError': 'Error al eliminar artículo',
      'shopping.clearCompletedConfirm': '¿Eliminar todos los artículos marcados de la lista?',
      'shopping.clearCompletedError': 'Error al limpiar artículos completados',
      
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
      'profile.twoFactor': 'Autenticación de dos factores',
      'profile.twoFactorDesc': 'Agregar una capa adicional de seguridad',
      'profile.twoFactorEnabled': 'Habilitado',
      'profile.twoFaDisabled': 'Autenticación de dos factores deshabilitada',
      'profile.twoFaDisableError': 'Error al deshabilitar autenticación de dos factores',
      'profile.disableTwoFa': 'Deshabilitar 2FA',
      'profile.disableTwoFaConfirm': '¿Estás seguro de que quieres deshabilitar la autenticación de dos factores?',
      'profile.disable': 'Deshabilitar',
      
      // Food Search
      searchForFoods: 'Buscar alimentos',
      searchPlaceholder: 'Buscar artículos de comida...',
      searchHint: 'Escribe al menos 2 caracteres para buscar',
      resultsFor: '{{count}} resultados para "{{query}}"',
      noResults: 'No se encontraron resultados',
      tryDifferent: 'Intenta con un término de búsqueda diferente',
      
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
  // Simplified other languages - keeping structure but removing barcode translations
  zh: {
    translation: {
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
      pantry: '食品储藏室',
      planner: '计划',
      shopping: '购物',
      profile: '个人资料',
      'pantry.title': '我的食品储藏室',
      'planner.title': '膳食计划',
      'planner.ingredientsAvailable': '{{count}}种食材可用',
      'shopping.title': '购物清单',
      'profile.title': '个人资料',
      searchForFoods: '搜索食物',
      searchPlaceholder: '搜索食品项目...',
      searchHint: '输入至少2个字符进行搜索',
      resultsFor: '"{{query}}"的{{count}}个结果',
      noResults: '未找到结果',
      tryDifferent: '尝试不同的搜索词',
    },
  },
  ja: {
    translation: {
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
      pantry: 'パントリー',
      planner: 'プランナー',
      shopping: '買い物',
      profile: 'プロフィール',
      'pantry.title': 'マイパントリー',
      'planner.title': '食事プランナー',
      'planner.ingredientsAvailable': '{{count}}種類の食材が利用可能',
      'shopping.title': '買い物リスト',
      'profile.title': 'プロフィール',
      searchForFoods: '食品を検索',
      searchPlaceholder: '食品を検索...',
      searchHint: '検索するには少なくとも2文字入力してください',
      resultsFor: '"{{query}}"の{{count}}件の結果',
      noResults: '結果が見つかりません',
      tryDifferent: '別の検索語を試してください',
    },
  },
  de: {
    translation: {
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
      pantry: 'Vorratskammer',
      planner: 'Planer',
      shopping: 'Einkaufen',
      profile: 'Profil',
      'pantry.title': 'Meine Vorratskammer',
      'planner.title': 'Essensplaner',
      'planner.ingredientsAvailable': '{{count}} Zutaten verfügbar',
      'shopping.title': 'Einkaufsliste',
      'profile.title': 'Profil',
      searchForFoods: 'Lebensmittel suchen',
      searchPlaceholder: 'Lebensmittel suchen...',
      searchHint: 'Geben Sie mindestens 2 Zeichen ein, um zu suchen',
      resultsFor: '{{count}} Ergebnisse für "{{query}}"',
      noResults: 'Keine Ergebnisse gefunden',
      tryDifferent: 'Versuchen Sie einen anderen Suchbegriff',
    },
  },
  nl: {
    translation: {
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
      pantry: 'Voorraadkast',
      planner: 'Planner',
      shopping: 'Boodschappen',
      profile: 'Profiel',
      'pantry.title': 'Mijn Voorraadkast',
      'planner.title': 'Maaltijdplanner',
      'planner.ingredientsAvailable': '{{count}} ingrediënten beschikbaar',
      'shopping.title': 'Boodschappenlijst',
      'profile.title': 'Profiel',
      searchForFoods: 'Voedsel zoeken',
      searchPlaceholder: 'Zoek naar voedsel...',
      searchHint: 'Typ minimaal 2 tekens om te zoeken',
      resultsFor: '{{count}} resultaten voor "{{query}}"',
      noResults: 'Geen resultaten gevonden',
      tryDifferent: 'Probeer een andere zoekterm',
    },
  },
  fr: {
    translation: {
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
      pantry: 'Garde-manger',
      planner: 'Planificateur',
      shopping: 'Courses',
      profile: 'Profil',
      'pantry.title': 'Mon Garde-manger',
      'planner.title': 'Planificateur de repas',
      'planner.ingredientsAvailable': '{{count}} ingrédients disponibles',
      'shopping.title': 'Liste de courses',
      'profile.title': 'Profil',
      searchForFoods: 'Rechercher des aliments',
      searchPlaceholder: 'Rechercher des aliments...',
      searchHint: 'Tapez au moins 2 caractères pour rechercher',
      resultsFor: '{{count}} résultats pour "{{query}}"',
      noResults: 'Aucun résultat trouvé',
      tryDifferent: 'Essayez un terme de recherche différent',
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
