<template>
    <form @submit.prevent="handleSubmit">
        <div class="mb-3">
            <label class="form-label">Title</label>
            <input type="text" class="form-control" v-model="form.title" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Details</label>
            <textarea class="form-control" v-model="form.details" rows="4" required></textarea>
        </div>
        <div class="mb-3">
            <label class="form-label">Image</label>
            <input type="file" class="form-control" @change="handleImageChange"
                   :required="!editing" accept="image/*">
        </div>
        <button type="submit" class="btn btn-primary">
            {{ editing ? 'Update' : 'Create' }} Product
        </button>
    </form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({})
    },
    editing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit']);

const form = ref({
    title: props.initialData.title || '',
    details: props.initialData.details || '',
    image: null
});

const handleImageChange = (e) => {
    form.value.image = e.target.files[0];
};

const handleSubmit = () => {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('details', form.value.details);
    if (form.value.image) {
        formData.append('image', form.value.image);
    }
    emit('submit', formData);
};
</script>
