<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal">
        <p class="modal-message">{{ message }}</p>
        <button @click="closeModal">확인</button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        isVisible: {
            type: Boolean,
            required: true // 부모컴포넌트에서 반드시 값을 받아야함. 
        },
        message: {
            type: String,
            required: true
        }
    },
    methods: {
        closeModal() {
            this.$emit('close')  // 모달을 닫을 때 부모에게 이벤트 전달
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-message {
    margin-bottom: 20px;
}

button {
    padding: 10px 15px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #0056b3;
}
</style>  