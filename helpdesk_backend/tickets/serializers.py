from rest_framework import serializers
from .models import Ticket, TicketHistory, Comment
from customers.models import Customer


class TicketHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketHistory
        fields = ['id', 'change_description', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        ticket = data.get('ticket')
        if ticket and ticket.status == Ticket.Status.CLOSED:
            raise serializers.ValidationError(
                "in the Closed ticket can't be added comment"
            )
        return data


class TicketSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    history = TicketHistorySerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'customer', 'customer_name',
            'subject', 'description', 'category',
            'priority', 'status',
            'created_at', 'updated_at',
            'history', 'comments',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']



class TicketStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['status']

    # Kaunsa status kaunse status se aage ja sakta hai
    VALID_TRANSITIONS = {
        Ticket.Status.OPEN: [Ticket.Status.IN_PROGRESS],
        Ticket.Status.IN_PROGRESS: [Ticket.Status.RESOLVED],
        Ticket.Status.RESOLVED: [Ticket.Status.CLOSED],
        Ticket.Status.CLOSED: [],  # Closed ke aage kuch nahi
    }

    def validate_status(self, new_status):
        current_status = self.instance.status

        # Rule: Closed ticket ko change hi nahi kar sakte
        if current_status == Ticket.Status.CLOSED:
            raise serializers.ValidationError(
                "Closed ticket can't be edit"
            )

        # Rule: Same status dobara set karna allow nahi
        if new_status == current_status:
            raise serializers.ValidationError(
                f"Ticket already '{current_status}'  in side the status ."
            )

        # Rule: Sequence follow karna zaroori hai (skip allowed nahi)
        allowed_next = self.VALID_TRANSITIONS[current_status]
        if new_status not in allowed_next:
            raise serializers.ValidationError(
                f"'{current_status}' can't be  '{new_status}' go directly "
                f"Allowed next status: {allowed_next}"
            )

        return new_status        