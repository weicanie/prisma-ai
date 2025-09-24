import { Modal } from 'antd';
import type { RcFile } from 'antd/es/upload';
import Dragger, { type DraggerProps } from 'antd/es/upload/Dragger';
import axios from 'axios';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { presignedUrl } from '../services/oss/uploadFile';
import AntdThemeHoc from './AntdThemeHoc';

interface FileUploadProps {
	value?: string;
	onChange: (value: string) => void;
	type: 'image' | 'file';
}

function FileUpload(props: FileUploadProps) {
	const { onChange } = props;
	const filePresignedURLRef = useRef<string>('');
	const draggerProps: DraggerProps = {
		name: 'file',
		action: async (file: RcFile) => {
			const { data } = await presignedUrl(file.name);
			filePresignedURLRef.current = decodeURIComponent(data.data);
			return data.data;
		},
		//直传OSS
		async customRequest(options) {
			const { onSuccess, file, action } = options;

			const res = await axios.put(action, file);

			onSuccess!(res.data);
		},
		// 上传成功后，将文件URL传给父组件
		onChange(info) {
			const { status } = info.file;
			if (status === 'done') {
				//用于访问文件的URL
				const fileUrl = filePresignedURLRef.current.split('?')[0];
				onChange(fileUrl);
				toast.success(`${info.file.name} 文件上传成功`);
			} else if (status === 'error') {
				toast.error(`${info.file.name} 文件上传失败`);
			}
		}
	};

	const dragger = (
		<Dragger {...draggerProps}>
			<p className="ant-upload-text">拖拽文件到此处或点击上传</p>
		</Dragger>
	);

	return props?.value ? (
		<div>
			{props.type === 'image' ? (
				<img src={props.value} alt="图片" width="100" height="100" />
			) : (
				props.value
			)}
			{dragger}
		</div>
	) : (
		<div>{dragger}</div>
	);
}

interface UploadModalProps {
	isOpen: boolean;
	handleClose: (fileUrl?: string) => void;
	type: 'image' | 'file';
}

function UploadModal(props: UploadModalProps) {
	const [fileUrl, setFileUrl] = useState<string>('');

	return (
		<AntdThemeHoc>
			<Modal
				title={`上传${props.type === 'image' ? '图片' : '文件'}`}
				open={props.isOpen}
				onOk={() => {
					props.handleClose(fileUrl);
					setFileUrl('');
				}}
				onCancel={() => props.handleClose()}
				okText={'确认'}
				cancelText={'取消'}
			>
				<FileUpload
					value={fileUrl}
					type={props.type}
					onChange={(value: string) => {
						setFileUrl(value);
					}}
				/>
			</Modal>
		</AntdThemeHoc>
	);
}
export default UploadModal;
