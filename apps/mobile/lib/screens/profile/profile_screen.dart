import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/app_theme.dart';
import '../../utils/constants.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Membership? _membership;
  Map<String, dynamic> _rating = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    setState(() => _loading = true);
    final results = await Future.wait([
      ApiService().getMyMembership(user.id),
      ApiService().getPlayerRating(user.id),
    ]);
    setState(() {
      _membership = results[0] as Membership?;
      _rating = results[1] as Map<String, dynamic>;
      _loading = false;
    });
  }

  Future<void> _upgrade(String type) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    try {
      await ApiService().upgradeMembership(user.id, type);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đã nâng cấp lên $type!'), backgroundColor: Colors.green),
        );
        _load();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    if (user == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hồ sơ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              context.go('/login');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // Profile header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [AppTheme.primary, Color(0xFF2E8B57)]),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.white,
                      child: Text(
                        user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'T',
                        style: const TextStyle(fontSize: 32, color: AppTheme.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(user.fullName, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('@${user.username}', style: const TextStyle(color: Colors.white70)),
                    if (user.city != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.location_on, color: Colors.white70, size: 14),
                          Text(user.city!, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              if (_loading)
                const Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())
              else ...[
                // Membership card
                _SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hội viên', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppConstants.membershipLabels[_membership?.type ?? 'FREE'] ?? 'Free',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primary),
                              ),
                              if (_membership?.expiresAt != null)
                                Text(
                                  'Hết hạn: ${_membership!.expiresAt!.substring(0, 10)}',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                            ],
                          ),
                          if ((_membership?.type ?? 'FREE') != 'ELITE')
                            OutlinedButton(
                              onPressed: () => _showUpgradeSheet(context),
                              child: const Text('Nâng cấp'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Rating card
                _SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Rating & Xếp hạng', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _RatingStat('Rating', (_rating['current_rating'] as num?)?.toStringAsFixed(2) ?? '--', AppTheme.primary),
                          ),
                          Expanded(
                            child: _RatingStat('Tier', _rating['tier'] as String? ?? '--', Colors.orange),
                          ),
                          Expanded(
                            child: _RatingStat('Điểm ATP', '${_rating['ranking_points'] ?? 0}', Colors.purple),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Contact info
                _SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Thông tin liên hệ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      _InfoRow(Icons.email_outlined, user.email),
                      if (user.phone != null) _InfoRow(Icons.phone_outlined, user.phone!),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showUpgradeSheet(BuildContext context) {
    final currentType = _membership?.type ?? 'FREE';
    final upgrades = AppConstants.membershipFees.entries
        .where((e) {
          final order = ['FREE', 'BASIC', 'RANKED', 'ELITE'];
          return order.indexOf(e.key) > order.indexOf(currentType);
        })
        .toList();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nâng cấp hội viên', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...upgrades.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ElevatedButton(
                onPressed: () { Navigator.pop(context); _upgrade(e.key); },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppConstants.membershipLabels[e.key] ?? e.key),
                    Text(e.value == 0 ? 'Miễn phí' : '${(e.value / 1000).toStringAsFixed(0)}K VND/năm'),
                  ],
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final Widget child;
  const _SectionCard({required this.child});

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    child: Padding(padding: const EdgeInsets.all(16), child: child),
  );
}

class _RatingStat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _RatingStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
      Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
    ],
  );
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(fontSize: 14)),
      ],
    ),
  );
}
