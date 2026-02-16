import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { MarketCard } from '@components/MarketCard';
import { Market } from '@app-types/models';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

export const MarketsScreen = () => {
  const { isRTL, tr } = useLanguage();
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    width: '100%',
  } as const;
  const [markets, setMarkets] = useState<Market[]>([]);

  const fetchMarkets = async () => {
    try {
      const response = await api.get<{ markets: Market[] }>('/markets');
      setMarkets(response.markets || []);
    } catch (_error) {
      setMarkets([]);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title={tr('الأسواق', 'Markets')} subtitle={tr('الأسواق التي نعمل معها', 'Markets we work with')} />
      <Text style={[styles.hint, textDirectionStyle]}>{tr('نعرض لك أسواقنا المعتمدة لمتابعة مصدر المنتجات والجودة.', 'Browse our approved markets and track product origin and quality.')}</Text>

      {!markets.length ? <Text style={[styles.emptyText, textDirectionStyle]}>{tr('لا توجد أسواق متاحة حالياً.', 'No markets available right now.')}</Text> : null}
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hint: {
    color: '#14532d',
    marginBottom: 4,
  },
  emptyText: {
    color: '#4b6a5a',
  },
});
