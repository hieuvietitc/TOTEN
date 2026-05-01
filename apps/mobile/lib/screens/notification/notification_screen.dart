import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class NotificationScreen extends ConsumerStatefulWidget {
  const NotificationScreen({super.key});
  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  List<dynamic> _notifications = [];
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
    final list = await ApiService().getNotifications(user.id);
    setState(() { _notifications = list; _loading = false; });
  }

  IconData _notifIcon(String type) => switch (type) {
    'MATCH_RESULT' => Icons.sports_tennis,
    'RANKING_UPDATE' => Icons.leaderboard,
    'BOOKING_CONFIRMATION' => Icons.calendar_today,
    'MEMBERSHIP_EXPIRY' => Icons.card_membership,
    'TOURNAMENT_REGISTRATION' => Icons.emoji_events,
    'FRAUD_ALERT' => Icons.warning_amber,
    _ => Icons.notifications_outlined,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _notifications.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                          SizedBox(height: 12),
                          Text('Chưa có thông báo', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      itemCount: _notifications.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (_, i) {
                        final n = _notifications[i] as Map<String, dynamic>;
                        final isRead = n['is_read'] as bool? ?? false;
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isRead ? Colors.grey.shade200 : Colors.green.shade100,
                            child: Icon(
                              _notifIcon(n['type'] as String? ?? ''),
                              color: isRead ? Colors.grey : Colors.green,
                              size: 20,
                            ),
                          ),
                          title: Text(
                            n['title'] as String? ?? '',
                            style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                          ),
                          subtitle: Text(n['body'] as String? ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: !isRead
                              ? Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle))
                              : null,
                        );
                      },
                    ),
            ),
    );
  }
}
