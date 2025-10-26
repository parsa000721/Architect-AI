export interface Project {
  id: number;
  name: string;
  deadline: string;
  status: 'जारी है' | 'योजना चरण में' | 'पूर्ण' | 'शुरू नहीं हुआ';
}

export enum Role {
  USER = 'उपयोगकर्ता',
  ADMIN = 'एडमिन',
}

export type Material = {
  name: string;
  unit: string;
  rate: number;
  quantity: number;
};

export type OtherCost = {
  name: string;
  amount: number;
};

export type ElementType = 
  'दीवार' | 'खिड़की' | 'कॉलम' | 'स्लैब' | 'दरवाज़ा' |
  'सीढ़ियाँ' | 'बालकनी' | 'स्तंभ' | 'मेहराब' | 'चिमनी' | 'रोशनदान' |
  'बाथरूम' | 'किचन' | 'डाइनिंग टेबल' | 'बिस्तर' |
  'अलमारी' | 'सोफ़ा' | 'आरामकुर्सी' | 'कॉफ़ी टेबल' | 'टीवी यूनिट' |
  'बुकशेल्फ़' | 'पौधा' | 'गलीचा' | 'लैंप' | 'फूलदान' |
  'दीवार घड़ी' | 'आईना';


export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation?: number;
}

export interface AppSettings {
  designer: {
    defaultGridVisible: boolean;
    defaultSnappingEnabled: boolean;
  };
}