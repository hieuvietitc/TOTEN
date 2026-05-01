import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';
import '../../utils/constants.dart';

class MembershipScreen extends ConsumerWidget {
  const MembershipScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tiers = [
      _TierInfo(
        type: 'FREE',
        label: 'Free ID',
        price: 0,
        color: Colors.grey,
        features: ['Đăng ký TOTEN ID', 'Xem lịch sân', 'Nhập kết quả casual'],
      ),
      _TierInfo(
        type: 'BASIC',
        label: 'Basic Member',
        price: 400000,
        color: Colors.blue,
        features: ['Tất cả quyền Free', 'Đặt sân ưu tiên', 'Tham gia giải LOCAL', 'Xem ranking CLB'],
      ),
      _TierInfo(
        type: 'RANKED',
        label: 'Ranked Member',
        price: 1000000,
        color: AppTheme.primary,
        features: ['Tất cả quyền Basic', 'Tính điểm ranking quốc gia', 'Tham gia giải CITY/PROVINCIAL', 'Matchmaking AI'],
        isPopular: true,
      ),
      _TierInfo(
        type: 'ELITE',
        label: 'Elite Member',
        price: 3000000,
        color: Colors.purple,
        features: ['Tất cả quyền Ranked', 'Tham gia National Championship', 'Priority support', 'Analytics nâng cao'],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Nâng cấp hội viên')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: tiers.length,
        itemBuilder: (_, i) {
          final t = tiers[i];
          return _TierCard(
            info: t,
            onUpgrade: () async {
              final user = ref.read(currentUserProvider);
              if (user == null) return;
              try {
                await ApiService().upgradeMembership(user.id, t.type);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Đã nâng cấp lên ${t.label}!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
                  );
                }
              }
            },
          );
        },
      ),
    );
  }
}

class _TierInfo {
  final String type, label;
  final double price;
  final Color color;
  final List<String> features;
  final bool isPopular;
  const _TierInfo({
    required this.type,
    required this.label,
    required this.price,
    required this.color,
    required this.features,
    this.isPopular = false,
  });
}

class _TierCard extends StatelessWidget {
  final _TierInfo info;
  final VoidCallback onUpgrade;
  const _TierCard({required this.info, required this.onUpgrade});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: info.isPopular ? info.color : Colors.transparent, width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(info.label, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: info.color)),
                if (info.isPopular)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: info.color, borderRadius: BorderRadius.circular(12)),
                    child: const Text('Phổ biến', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              info.price == 0 ? 'Miễn phí' : '${(info.price / 1000).toStringAsFixed(0)}K VND/năm',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: info.color),
            ),
            const SizedBox(height: 12),
            ...info.features.map((f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Icon(Icons.check_circle, size: 16, color: info.color),
                  const SizedBox(width: 8),
                  Text(f, style: const TextStyle(fontSize: 14)),
                ],
              ),
            )),
            if (info.type != 'FREE') ...[
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: onUpgrade,
                style: ElevatedButton.styleFrom(backgroundColor: info.color),
                child: Text('Chọn ${info.label}'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
